import { createContext, useEffect, useMemo, type ReactNode } from "react";
import { useWorkspaceStore } from "../../state/workspaceStore";
import { useAssistantStore } from "../../state/assistantStore";
import {
  conversationsForWorkspace,
  pinnedConversations,
  recentConversations,
  workspaceStats,
  type Conversation,
  type WorkspaceStats
} from "../../domain/conversation/conversation";
import {
  DEFAULT_MODEL,
  greetingFor,
  type Workspace
} from "../../domain/workspace/workspace";

type WorkspaceView = {
  hydrated: boolean;
  workspaces: Workspace[];
  conversations: Conversation[];
  activeWorkspace: Workspace | null;
  activeConversation: Conversation | null;
  activeWorkspaceId: string;
  activeConversationId: string | null;
  workspaceConversations: Conversation[];
  pinned: Conversation[];
  recent: Conversation[];
  stats: WorkspaceStats;
  suggestions: string[];
  greeting: string;
  effectiveModel: string;
};

const WorkspaceContextValue = createContext<null>(null);

// Hydrates the workspace state once and keeps preload listeners local to
// effects, per the app's local contracts.
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const hydrate = useWorkspaceStore((state) => state.hydrate);
  const hydrated = useWorkspaceStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  return <WorkspaceContextValue.Provider value={null}>{children}</WorkspaceContextValue.Provider>;
}

// Derived, render-friendly view of the workspace state. Components read this
// instead of reaching into the store's raw arrays.
export function useWorkspace(): WorkspaceView {
  const hydrated = useWorkspaceStore((state) => state.hydrated);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const conversations = useWorkspaceStore((state) => state.conversations);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const activeConversationId = useWorkspaceStore((state) => state.activeConversationId);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0] ?? null,
    [workspaces, activeWorkspaceId]
  );
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );
  const workspaceConversations = useMemo(
    () => conversationsForWorkspace(conversations, activeWorkspaceId),
    [conversations, activeWorkspaceId]
  );
  const pinned = useMemo(() => pinnedConversations(conversations), [conversations]);
  const recent = useMemo(() => recentConversations(conversations), [conversations]);
  const stats = useMemo(
    () => workspaceStats(conversations, activeWorkspaceId),
    [conversations, activeWorkspaceId]
  );
  const effectiveModel = useMemo(
    () => activeConversation?.model ?? activeWorkspace?.preferredModel ?? DEFAULT_MODEL,
    [activeConversation, activeWorkspace]
  );

  return {
    hydrated,
    workspaces,
    conversations,
    activeWorkspace,
    activeConversation,
    activeWorkspaceId,
    activeConversationId,
    workspaceConversations,
    pinned,
    recent,
    stats,
    suggestions: activeWorkspace?.suggestions ?? [],
    greeting: activeWorkspace ? greetingFor(activeWorkspace) : "Welcome",
    effectiveModel
  };
}

// Cross-store orchestration: switching workspace/conversation coordinates the
// workspace records with the assistant's live message buffer. Kept here (not in
// either store) so the dependency stays one-directional.
export function useWorkspaceActions() {
  return useMemo(
    () => ({
      switchWorkspace(id: string) {
        useWorkspaceStore.getState().setActiveWorkspace(id);
        useAssistantStore.getState().resetHistory();
      },
      openConversation(id: string) {
        const conversation = useWorkspaceStore.getState().openConversation(id);
        useAssistantStore.getState().loadHistory(conversation?.messages ?? []);
      },
      newChat(workspaceId?: string) {
        if (workspaceId) {
          useWorkspaceStore.getState().setActiveWorkspace(workspaceId);
        }
        useAssistantStore.getState().newChat();
      },
      startSuggestion(text: string) {
        useAssistantStore.getState().seedPrompt(text);
      }
    }),
    []
  );
}
