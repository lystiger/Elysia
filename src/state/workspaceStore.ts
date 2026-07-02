import { create } from "zustand";
import { workspaceService } from "../services/workspace/WorkspaceService";
import {
  DEFAULT_MODEL,
  GENERAL_WORKSPACE_ID,
  createWorkspace as makeWorkspace,
  touchWorkspace,
  type CreateWorkspaceInput,
  type Workspace
} from "../domain/workspace/workspace";
import {
  createConversation as makeConversation,
  deriveTitle,
  isUntitled,
  type Conversation
} from "../domain/conversation/conversation";
import type { Message } from "../domain/message/message";

const LAST_WORKSPACE_KEY = "elysia:lastWorkspaceId";

type WorkspaceState = {
  workspaces: Workspace[];
  conversations: Conversation[];
  activeWorkspaceId: string;
  activeConversationId: string | null;
  hydrated: boolean;
  commandPaletteOpen: boolean;

  hydrate: () => Promise<void>;

  setActiveWorkspace: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  effectiveModel: () => string;

  createWorkspace: (input: CreateWorkspaceInput) => Workspace;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setWorkspaceModel: (id: string, model: string) => void;

  ensureActiveConversation: () => string;
  openConversation: (id: string) => Conversation | null;
  commitActiveConversation: (messages: Message[], options?: { model?: string }) => void;
  renameConversation: (id: string, title: string) => void;
  togglePinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;

  toggleCommandPalette: (open?: boolean) => void;
};

let persistTimer: ReturnType<typeof setTimeout> | null = null;

// Debounced write-through so token-by-token streaming commits don't hammer the
// disk. Both collections are written together on the trailing edge.
function persist(get: () => WorkspaceState): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(() => {
    const { workspaces, conversations } = get();
    void workspaceService.saveWorkspaces(workspaces);
    void workspaceService.saveConversations(conversations);
  }, 350);
}

function readLastWorkspaceId(): string | null {
  try {
    return localStorage.getItem(LAST_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

function writeLastWorkspaceId(id: string): void {
  try {
    localStorage.setItem(LAST_WORKSPACE_KEY, id);
  } catch {
    // Ignore storage failures — remembering the last workspace is best-effort.
  }
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  conversations: [],
  activeWorkspaceId: GENERAL_WORKSPACE_ID,
  activeConversationId: null,
  hydrated: false,
  commandPaletteOpen: false,

  hydrate: async () => {
    const { workspaces, conversations } = await workspaceService.load();
    const remembered = readLastWorkspaceId();
    const activeWorkspaceId =
      remembered && workspaces.some((w) => w.id === remembered)
        ? remembered
        : workspaces[0]?.id ?? GENERAL_WORKSPACE_ID;
    set({ workspaces, conversations, activeWorkspaceId, activeConversationId: null, hydrated: true });
  },

  setActiveWorkspace: (id) => {
    // Opening a workspace lands on its home; clearing the active conversation
    // is what App uses to show the workspace landing page vs the dialogue.
    set({ activeWorkspaceId: id, activeConversationId: null });
    writeLastWorkspaceId(id);
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  effectiveModel: () => {
    const state = get();
    const conversation = state.conversations.find((c) => c.id === state.activeConversationId);
    if (conversation?.model) {
      return conversation.model;
    }
    const workspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
    return workspace?.preferredModel ?? DEFAULT_MODEL;
  },

  createWorkspace: (input) => {
    const workspace = makeWorkspace(input);
    set((state) => ({ workspaces: [...state.workspaces, workspace] }));
    persist(get);
    return workspace;
  },

  updateWorkspace: (id, patch) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? touchWorkspace(w, patch) : w))
    }));
    persist(get);
  },

  deleteWorkspace: (id) => {
    if (id === GENERAL_WORKSPACE_ID) {
      return; // General is the permanent fallback and cannot be deleted.
    }
    set((state) => {
      const workspaces = state.workspaces.filter((w) => w.id !== id);
      // Reassign orphaned conversations to General rather than losing them.
      const conversations = state.conversations.map((c) =>
        c.workspaceId === id ? { ...c, workspaceId: GENERAL_WORKSPACE_ID } : c
      );
      const activeWorkspaceId =
        state.activeWorkspaceId === id ? GENERAL_WORKSPACE_ID : state.activeWorkspaceId;
      const activeConversationId =
        state.activeWorkspaceId === id ? null : state.activeConversationId;
      return { workspaces, conversations, activeWorkspaceId, activeConversationId };
    });
    persist(get);
  },

  setWorkspaceModel: (id, model) => {
    const next = model.trim();
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? touchWorkspace(w, { preferredModel: next.length > 0 ? next : null }) : w
      )
    }));
    persist(get);
  },

  ensureActiveConversation: () => {
    const state = get();
    if (
      state.activeConversationId &&
      state.conversations.some((c) => c.id === state.activeConversationId)
    ) {
      return state.activeConversationId;
    }
    const workspaceId = state.activeWorkspaceId || GENERAL_WORKSPACE_ID;
    const model = state.workspaces.find((w) => w.id === workspaceId)?.preferredModel ?? DEFAULT_MODEL;
    const conversation = makeConversation(workspaceId, "New chat", model);
    set((current) => ({
      conversations: [conversation, ...current.conversations],
      activeWorkspaceId: workspaceId,
      activeConversationId: conversation.id
    }));
    persist(get);
    return conversation.id;
  },

  openConversation: (id) => {
    const conversation = get().conversations.find((c) => c.id === id) ?? null;
    if (conversation) {
      set({ activeConversationId: id, activeWorkspaceId: conversation.workspaceId });
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
    persist(get);
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
    persist(get);
  },

  togglePinConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    }));
    persist(get);
  },

  deleteConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
    }));
    persist(get);
  },

  toggleCommandPalette: (open) =>
    set((state) => ({ commandPaletteOpen: open ?? !state.commandPaletteOpen }))
}));

// Reactive derived selector for the effective model (conversation model wins,
// then workspace preference, then the global default).
export function useEffectiveModel(): string {
  return useWorkspaceStore((state) => {
    const conversation = state.conversations.find((c) => c.id === state.activeConversationId);
    if (conversation?.model) {
      return conversation.model;
    }
    const workspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
    return workspace?.preferredModel ?? DEFAULT_MODEL;
  });
}
