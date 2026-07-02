import { createContext, useEffect, useMemo, type ReactNode } from "react";
import { useSpaceStore, type FolderContextResult, type ManualSpaceInput } from "../../state/spaceStore";
import { useAssistantStore } from "../../state/assistantStore";
import { pickFolder } from "../../services/filesystem/folderContext";
import { DEFAULT_MODEL, greetingFor, type Space } from "../../domain/space/space";
import {
  conversationsForSpace,
  pinnedConversations,
  recentConversations,
  spaceStats,
  type Conversation,
  type SpaceStats
} from "../../domain/conversation/conversation";

type SpaceView = {
  hydrated: boolean;
  spaces: Space[];
  conversations: Conversation[];
  activeSpace: Space | null;
  activeConversation: Conversation | null;
  activeSpaceId: string;
  activeConversationId: string | null;
  spaceConversations: Conversation[];
  pinned: Conversation[];
  recent: Conversation[];
  stats: SpaceStats;
  suggestions: string[];
  greeting: string;
  effectiveModel: string;
};

const SpaceContextValue = createContext<null>(null);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const hydrate = useSpaceStore((state) => state.hydrate);
  const hydrated = useSpaceStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const state = useSpaceStore.getState();
    const active = state.conversations.find(
      (conversation) => conversation.id === state.activeConversationId
    );
    useAssistantStore.getState().loadHistory(active?.messages ?? []);
  }, [hydrated]);

  return <SpaceContextValue.Provider value={null}>{children}</SpaceContextValue.Provider>;
}

// Derived, render-friendly view of the Space state.
export function useSpace(): SpaceView {
  const hydrated = useSpaceStore((state) => state.hydrated);
  const spaces = useSpaceStore((state) => state.spaces);
  const conversations = useSpaceStore((state) => state.conversations);
  const activeSpaceId = useSpaceStore((state) => state.activeSpaceId);
  const activeConversationId = useSpaceStore((state) => state.activeConversationId);
  const currentModel = useSpaceStore((state) => state.currentModel);

  const activeSpace = useMemo(
    () => spaces.find((s) => s.id === activeSpaceId) ?? spaces[0] ?? null,
    [spaces, activeSpaceId]
  );
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );
  const spaceConversations = useMemo(
    () => conversationsForSpace(conversations, activeSpaceId),
    [conversations, activeSpaceId]
  );
  const pinned = useMemo(() => pinnedConversations(conversations), [conversations]);
  const recent = useMemo(() => recentConversations(conversations), [conversations]);
  const stats = useMemo(() => spaceStats(conversations, activeSpaceId), [conversations, activeSpaceId]);
  const effectiveModel = useMemo(
    () => activeConversation?.model ?? activeSpace?.preferredModel ?? currentModel ?? DEFAULT_MODEL,
    [activeConversation, activeSpace, currentModel]
  );

  return {
    hydrated,
    spaces,
    conversations,
    activeSpace,
    activeConversation,
    activeSpaceId,
    activeConversationId,
    spaceConversations,
    pinned,
    recent,
    stats,
    suggestions: activeSpace?.suggestions ?? [],
    greeting: activeSpace ? greetingFor(activeSpace) : "Welcome",
    effectiveModel
  };
}

// Cross-store orchestration: coordinates the Space records with the assistant's
// live message buffer, and bridges to the native folder picker. Kept here so the
// dependency direction stays one-way (assistant -> space).
export function useSpaceActions() {
  return useMemo(
    () => ({
      switchSpace(id: string) {
        useSpaceStore.getState().setActiveSpace(id);
        const state = useSpaceStore.getState();
        const conversation = state.conversations.find(
          (item) => item.id === state.activeConversationId
        );
        useAssistantStore.getState().loadHistory(conversation?.messages ?? []);
      },
      openConversation(id: string) {
        const conversation = useSpaceStore.getState().openConversation(id);
        useAssistantStore.getState().loadHistory(conversation?.messages ?? []);
      },
      newChat(spaceId?: string) {
        if (spaceId) {
          useSpaceStore.getState().setActiveSpace(spaceId);
        }
        useAssistantStore.getState().newChat();
      },
      startSuggestion(text: string) {
        useAssistantStore.getState().seedPrompt(text);
      },
      async addFolderAsSpace(): Promise<Space | null> {
        const folderPath = await pickFolder();
        if (!folderPath) {
          return null;
        }
        const space = await useSpaceStore.getState().createFolderSpace(folderPath);
        useSpaceStore.getState().setActiveSpace(space.id);
        useAssistantStore.getState().resetHistory();
        return space;
      },
      async createManualSpace(input: ManualSpaceInput): Promise<Space> {
        const space = await useSpaceStore.getState().createManualSpace(input);
        useSpaceStore.getState().setActiveSpace(space.id);
        useAssistantStore.getState().resetHistory();
        return space;
      },
      async removeSpace(id: string, mode: "move" | "delete") {
        await useSpaceStore.getState().removeSpace(id, mode);
        useAssistantStore.getState().resetHistory();
      },
      async injectFolderContext(): Promise<FolderContextResult> {
        const result = await useSpaceStore.getState().buildFolderContext();
        if (result.ok) {
          useAssistantStore.getState().appendSystemMessage(result.message);
        }
        return result;
      }
    }),
    []
  );
}
