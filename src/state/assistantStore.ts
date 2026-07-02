import { create } from "zustand";
import { pingOllama, streamFromOllama } from "../services/ollama";
import { playResponseComplete } from "../services/system/sound";
import { useSpaceStore } from "./spaceStore";
import type { Message, MessageErrorKind } from "../domain/message/message";

export type AssistantState =
  | "ready"
  | "idle"
  | "listening"
  | "thinking"
  | "generating"
  | "responding"
  | "focused"
  | "paused"
  | "offline"
  | "error";
export type ConnectionStatus = "checking" | "connected" | "offline";

type AssistantStore = {
  activeModel: string;
  availableModels: string[];
  appVersion: string;
  connectionStatus: ConnectionStatus;
  latencyMs: number | null;
  tokensPerSecond: number | null;
  history: Message[];
  historyOpen: boolean;
  promptSeed: string | null;
  state: AssistantState;
  isUserTyping: boolean;
  observedApp: string;
  abortController: AbortController | null;
  setActiveModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
  setState: (state: AssistantState) => void;
  setAppVersion: (version: string) => void;
  setTyping: (isTyping: boolean) => void;
  setObservedApp: (app: string) => void;
  focusComposer: (fn: () => void) => void;
  sendPrompt: (prompt: string) => Promise<void>;
  cancelGeneration: () => void;
  newChat: () => void;
  loadHistory: (messages: Message[]) => void;
  loadConversationMessages: (messages: Message[], model: string | null) => void;
  appendSystemMessage: (content: string) => void;
  resetHistory: () => void;
  toggleHistory: () => void;
  checkConnection: () => Promise<void>;
  seedPrompt: (text: string) => void;
  clearPromptSeed: () => void;
};

let focusComposerImpl: (() => void) | null = null;

function categorizeError(error: unknown): { kind: MessageErrorKind; message: string } {
  if (error instanceof DOMException && error.name === "AbortError") {
    return { kind: "aborted", message: "Generation stopped." };
  }
  if (error instanceof Error) {
    const message = error.message.length > 0 ? error.message : "Unable to reach Ollama.";
    const lower = message.toLowerCase();
    if (lower.includes("abort")) {
      return { kind: "aborted", message: "Generation stopped." };
    }
    if (lower.includes("not found") || lower.includes("model")) {
      return { kind: "unknown-model", message };
    }
    if (lower.includes("fetch") || lower.includes("network") || lower.includes("failed")) {
      return { kind: "offline", message };
    }
    return { kind: "unknown", message };
  }
  return { kind: "unknown", message: "Unknown Ollama error." };
}

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  activeModel: "gemma4:e4b",
  availableModels: [],
  appVersion: "",
  connectionStatus: "checking",
  latencyMs: null,
  tokensPerSecond: null,
  history: [],
  historyOpen: false,
  promptSeed: null,
  state: "idle",
  isUserTyping: false,
  observedApp: "Desktop",
  abortController: null,
  setActiveModel: (activeModel) => set({ activeModel }),
  setAvailableModels: (availableModels) => set({ availableModels }),
  setState: (state) => set({ state }),
  setAppVersion: (appVersion) => set({ appVersion }),
  setTyping: (isUserTyping) => set({ isUserTyping }),
  setObservedApp: (observedApp) => set({ observedApp }),
  focusComposer: (fn) => {
    focusComposerImpl = fn;
  },
  toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
  seedPrompt: (text) => {
    set({ promptSeed: text });
    focusComposerImpl?.();
  },
  clearPromptSeed: () => set({ promptSeed: null }),
  newChat: () => {
    // A new chat belongs to the current Space; the record is created lazily
    // on first send, so here we just clear the active conversation + buffer.
    useSpaceStore.getState().setActiveConversation(null);
    set({ history: [], state: "idle", historyOpen: false, tokensPerSecond: null });
    focusComposerImpl?.();
  },
  loadHistory: (messages) => {
    set({ history: messages, state: "idle", historyOpen: false, tokensPerSecond: null });
  },
  loadConversationMessages: (messages, model) => {
    set((state) => ({
      history: messages,
      activeModel: model ?? state.activeModel,
      state: "idle",
      historyOpen: false,
      tokensPerSecond: null
    }));
  },
  cancelGeneration: () => {
    get().abortController?.abort();
  },
  appendSystemMessage: (content) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }
    const spaces = useSpaceStore.getState();
    spaces.ensureActiveConversation();
    const message: Message = {
      id: crypto.randomUUID(),
      role: "system",
      content: trimmed
    };
    set((state) => ({ history: [...state.history, message] }));
    useSpaceStore.getState().commitActiveConversation(get().history, {
      model: useSpaceStore.getState().effectiveModel()
    });
  },
  resetHistory: () => {
    set({ history: [], state: "idle", historyOpen: false, tokensPerSecond: null });
  },
  checkConnection: async () => {
    const startedAt = performance.now();
    const reachable = await pingOllama();
    set({
      connectionStatus: reachable ? "connected" : "offline",
      latencyMs: reachable ? Math.round(performance.now() - startedAt) : null
    });
  },
  sendPrompt: async (prompt) => {
    // The active conversation (in the Space layer) is the durable record;
    // `history` here is its live streaming buffer. Ensure a conversation exists
    // and resolve the model from the current Space/conversation.
    const spaces = useSpaceStore.getState();
    spaces.ensureActiveConversation();
    const model = useSpaceStore.getState().effectiveModel();
    const systemContext = get()
      .history.filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n\n");
    const modelPrompt = systemContext
      ? `${systemContext}\n\nUser request:\n${prompt}`
      : prompt;

    const userEntry: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt
    };
    const assistantId = crypto.randomUUID();
    const controller = new AbortController();

    set((state) => ({
      history: [
        ...state.history,
        userEntry,
        {
          id: assistantId,
          role: "assistant",
          content: ""
        }
      ],
      state: "thinking",
      abortController: controller
    }));
    // Commit the opening turn so the conversation jumps to the top of "Recent"
    // and gets a title immediately.
    useSpaceStore.getState().commitActiveConversation(get().history, { model });

    try {
      let firstToken = true;
      let accumulatedContent = "";

      await streamFromOllama({
        model,
        prompt: modelPrompt,
        signal: controller.signal,
        onToken: (token) => {
          accumulatedContent += token;
          set((state) => {
            const newHistory = [...state.history];
            const lastIdx = newHistory.length - 1;
            const last = newHistory[lastIdx];
            if (last && last.id === assistantId) {
              newHistory[lastIdx] = { ...last, content: accumulatedContent };
            }
            return {
              history: newHistory,
              state: firstToken ? "responding" : state.state
            };
          });
          firstToken = false;
        },
        onDone: ({ tokensPerSecond }) => set({ tokensPerSecond })
      });

      set({ state: "idle", connectionStatus: "connected", abortController: null });
      useSpaceStore.getState().commitActiveConversation(get().history, { model });
      focusComposerImpl?.();
      playResponseComplete();
    } catch (error) {
      const { kind, message } = categorizeError(error);
      set((state) => ({
        history: state.history.map((entry) =>
          entry.id === assistantId
            ? { ...entry, content: message.length > 0 ? message : "Unable to reach Ollama.", error: true, errorKind: kind }
            : entry
        ),
        state: kind === "aborted" ? "idle" : "error",
        connectionStatus: kind === "aborted" ? state.connectionStatus : "offline",
        abortController: null
      }));
      useSpaceStore.getState().commitActiveConversation(get().history, { model });
    }
  }
}));
