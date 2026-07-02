import { create } from "zustand";
import { spaceRepository } from "../services/storage/SpaceRepository";
import { ConversationRepository } from "../services/storage/ConversationRepository";
import { buildFolderContextMessage, scanFolder } from "../services/filesystem/folderContext";
import {
  DEFAULT_MODEL,
  GENERAL_SPACE_ID,
  folderName,
  pickColor,
  type Space,
  type SpaceIcon
} from "../domain/space/space";
import {
  createConversation as makeConversation,
  deriveTitle,
  isUntitled,
  type Conversation
} from "../domain/conversation/conversation";
import type { Message } from "../domain/message/message";

const conversationRepository = new ConversationRepository();

export type ManualSpaceInput = {
  name: string;
  description?: string;
  icon?: SpaceIcon;
  preferredModel?: string | null;
};

export type RemoveMode = "move" | "delete";

export type FolderContextResult =
  | { ok: false }
  | { ok: true; message: string; fileCount: number };

type SpaceState = {
  spaces: Space[];
  conversations: Conversation[];
  activeSpaceId: string;
  activeConversationId: string | null;
  currentModel: string;
  hydrated: boolean;
  isScanning: boolean;
  commandPaletteOpen: boolean;
  spaceCreatorOpen: boolean;

  hydrate: () => Promise<void>;

  setActiveSpace: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  effectiveModel: () => string;

  createFolderSpace: (folderPath: string) => Promise<Space>;
  createManualSpace: (input: ManualSpaceInput) => Promise<Space>;
  renameSpace: (id: string, name: string) => Promise<void>;
  setSpaceModel: (id: string, model: string) => Promise<void>;
  removeSpace: (id: string, mode: RemoveMode) => Promise<void>;
  buildFolderContext: () => Promise<FolderContextResult>;

  ensureActiveConversation: () => string;
  openConversation: (id: string) => Conversation | null;
  commitActiveConversation: (messages: Message[], options?: { model?: string }) => void;
  renameConversation: (id: string, title: string) => void;
  togglePinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;

  toggleCommandPalette: (open?: boolean) => void;
  setSpaceCreatorOpen: (open: boolean) => void;
};

let persistTimer: ReturnType<typeof setTimeout> | null = null;

// Conversations are persisted in bulk (debounced) because streaming commits are
// frequent. Spaces persist per-operation through the repository.
function persistConversations(get: () => SpaceState): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(() => {
    void conversationRepository.saveAll(get().conversations);
  }, 350);
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  spaces: [],
  conversations: [],
  activeSpaceId: GENERAL_SPACE_ID,
  activeConversationId: null,
  currentModel: DEFAULT_MODEL,
  hydrated: false,
  isScanning: false,
  commandPaletteOpen: false,
  spaceCreatorOpen: false,

  hydrate: async () => {
    const spaces = await spaceRepository.list();
    const loadedConversations = await conversationRepository.list();
    const spaceIds = new Set(spaces.map((space) => space.id));
    const conversations = loadedConversations.map((conversation) =>
      spaceIds.has(conversation.spaceId)
        ? conversation
        : { ...conversation, spaceId: GENERAL_SPACE_ID, updatedAt: Date.now() }
    );
    if (conversations.some((conversation, index) => conversation !== loadedConversations[index])) {
      await conversationRepository.saveAll(conversations);
    }
    const active = await spaceRepository.getActive();
    const activeSpaceId =
      active && spaces.some((s) => s.id === active.id)
        ? active.id
        : spaces.find((s) => s.id === GENERAL_SPACE_ID)?.id ?? spaces[0]?.id ?? GENERAL_SPACE_ID;
    const activeSpace = spaces.find((s) => s.id === activeSpaceId);
    const latestConversation = conversations
      .filter((conversation) => conversation.spaceId === activeSpaceId)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    set({
      spaces,
      conversations,
      activeSpaceId,
      activeConversationId: latestConversation?.id ?? null,
      currentModel: activeSpace?.preferredModel ?? DEFAULT_MODEL,
      hydrated: true
    });
  },

  setActiveSpace: (id) => {
    // Restore the most recent conversation in the selected Space when one
    // exists; new Spaces naturally land on their home view.
    const now = Date.now();
    set((state) => {
      const latest = state.conversations
        .filter((conversation) => conversation.spaceId === id)
        .sort((a, b) => b.updatedAt - a.updatedAt)[0];
      const space = state.spaces.find((item) => item.id === id);
      return {
        activeSpaceId: id,
        activeConversationId: latest?.id ?? null,
        currentModel: space?.preferredModel ?? state.currentModel,
        spaces: state.spaces.map((item) =>
          item.id === id ? { ...item, lastOpenedAt: now } : item
        )
      };
    });
    void spaceRepository.setActive(id);
    void spaceRepository.update(id, { lastOpenedAt: now });
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  effectiveModel: () => {
    const state = get();
    const conversation = state.conversations.find((c) => c.id === state.activeConversationId);
    if (conversation?.model) {
      return conversation.model;
    }
    const space = state.spaces.find((s) => s.id === state.activeSpaceId);
    // Space preference wins; otherwise keep whatever model is currently in use.
    return space?.preferredModel ?? state.currentModel;
  },

  createFolderSpace: async (folderPath) => {
    const color = pickColor(get().spaces.length);
    const space = await spaceRepository.create({
      name: folderName(folderPath),
      folderPath,
      color
    });
    set((state) => ({ spaces: [...state.spaces, space] }));
    return space;
  },

  createManualSpace: async ({ name, description, icon, preferredModel }) => {
    const color = pickColor(get().spaces.length);
    const space = await spaceRepository.create({
      name,
      description,
      icon,
      preferredModel,
      color,
      folderPath: null
    });
    set((state) => ({ spaces: [...state.spaces, space] }));
    return space;
  },

  renameSpace: async (id, name) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return;
    }
    const updated = await spaceRepository.update(id, { name: trimmed });
    if (updated) {
      set((state) => ({ spaces: state.spaces.map((s) => (s.id === id ? updated : s)) }));
    }
  },

  setSpaceModel: async (id, model) => {
    const next = model.trim();
    const preferredModel = next.length > 0 ? next : null;
    const updated = await spaceRepository.update(id, { preferredModel });
    if (updated) {
      set((state) => ({
        spaces: state.spaces.map((s) => (s.id === id ? updated : s)),
        currentModel: next.length > 0 ? next : state.currentModel
      }));
    }
  },

  removeSpace: async (id, mode) => {
    if (id === GENERAL_SPACE_ID) {
      return;
    }
    set((state) => {
      const spaces = state.spaces.filter((s) => s.id !== id);
      const conversations =
        mode === "move"
          ? state.conversations.map((c) =>
              c.spaceId === id ? { ...c, spaceId: GENERAL_SPACE_ID, updatedAt: Date.now() } : c
            )
          : state.conversations.filter((c) => c.spaceId !== id);
      const leavingActive = state.activeSpaceId === id;
      return {
        spaces,
        conversations,
        activeSpaceId: leavingActive ? GENERAL_SPACE_ID : state.activeSpaceId,
        activeConversationId: leavingActive ? null : state.activeConversationId
      };
    });
    await spaceRepository.delete(id);
    await spaceRepository.setActive(get().activeSpaceId);
    await conversationRepository.saveAll(get().conversations);
  },

  buildFolderContext: async () => {
    const state = get();
    const space = state.spaces.find((s) => s.id === state.activeSpaceId);
    if (!space?.folderPath) {
      return { ok: false };
    }
    set({ isScanning: true });
    const scan = await scanFolder(space.folderPath);
    set({ isScanning: false });
    if (!scan) {
      return { ok: false };
    }
    return {
      ok: true,
      message: buildFolderContextMessage(space.name, scan),
      fileCount: scan.fileCount
    };
  },

  ensureActiveConversation: () => {
    const state = get();
    if (
      state.activeConversationId &&
      state.conversations.some((c) => c.id === state.activeConversationId)
    ) {
      return state.activeConversationId;
    }
    const spaceId = state.activeSpaceId || GENERAL_SPACE_ID;
    const model = get().effectiveModel();
    const conversation = makeConversation(spaceId, "New chat", model);
    set((current) => ({
      conversations: [conversation, ...current.conversations],
      activeSpaceId: spaceId,
      activeConversationId: conversation.id
    }));
    persistConversations(get);
    return conversation.id;
  },

  openConversation: (id) => {
    const conversation = get().conversations.find((c) => c.id === id) ?? null;
    if (conversation) {
      set({ activeConversationId: id, activeSpaceId: conversation.spaceId });
    }
    return conversation;
  },

  commitActiveConversation: (messages, options) => {
    const activeConversationId = get().activeConversationId;
    if (!activeConversationId) {
      return;
    }
    set((state) => ({
      conversations: state.conversations.map((conversation) => {
        if (conversation.id !== activeConversationId) {
          return conversation;
        }
        const firstUser = messages.find((m) => m.role === "user");
        const title =
          isUntitled(conversation) && firstUser ? deriveTitle(firstUser.content) : conversation.title;
        return {
          ...conversation,
          messages,
          title,
          model: options?.model ?? conversation.model,
          updatedAt: Date.now()
        };
      })
    }));
    persistConversations(get);
  },

  renameConversation: (id, title) => {
    const next = title.trim();
    if (next.length === 0) {
      return;
    }
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title: next, updatedAt: Date.now() } : c
      )
    }));
    persistConversations(get);
  },

  togglePinConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    }));
    persistConversations(get);
  },

  deleteConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
    }));
    persistConversations(get);
  },

  toggleCommandPalette: (open) =>
    set((state) => ({ commandPaletteOpen: open ?? !state.commandPaletteOpen })),

  setSpaceCreatorOpen: (open) => set({ spaceCreatorOpen: open })
}));

// Reactive derived selector for the effective model.
export function useEffectiveModel(): string {
  return useSpaceStore((state) => {
    const conversation = state.conversations.find((c) => c.id === state.activeConversationId);
    if (conversation?.model) {
      return conversation.model;
    }
    const space = state.spaces.find((s) => s.id === state.activeSpaceId);
    return space?.preferredModel ?? state.currentModel;
  });
}
