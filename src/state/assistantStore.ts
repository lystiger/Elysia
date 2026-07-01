import { create } from "zustand";
import { pingOllama, streamFromOllama } from "../services/ollama";
import { playResponseComplete } from "../services/sound";

export type AssistantState = "ready" | "thinking" | "generating" | "offline";
export type ConnectionStatus = "checking" | "connected" | "offline";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

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
  setActiveModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
  setState: (state: AssistantState) => void;
  setAppVersion: (version: string) => void;
  focusComposer: (fn: () => void) => void;
  sendPrompt: (prompt: string) => Promise<void>;
  newChat: () => void;
  toggleHistory: () => void;
  checkConnection: () => Promise<void>;
  seedPrompt: (text: string) => void;
  clearPromptSeed: () => void;
};

let focusComposerImpl: (() => void) | null = null;

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
  state: "ready",
  setActiveModel: (activeModel) => set({ activeModel }),
  setAvailableModels: (availableModels) => set({ availableModels }),
  setState: (state) => set({ state }),
  setAppVersion: (appVersion) => set({ appVersion }),
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
    set({ history: [], state: "ready", historyOpen: false });
    focusComposerImpl?.();
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
    const userEntry: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt
    };
    const assistantId = crypto.randomUUID();

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
      state: "thinking"
    }));

    try {
      let firstToken = true;
      let accumulatedContent = "";

      await streamFromOllama({
        model: get().activeModel,
        prompt,
        onToken: (token) => {
          accumulatedContent += token;
          set((state) => {
            const lastEntry = state.history[state.history.length - 1];
            if (!lastEntry || lastEntry.id !== assistantId) {
              return { state: firstToken ? "generating" : state.state };
            }

            const newHistory = [...state.history];
            newHistory[newHistory.length - 1] = { ...lastEntry, content: accumulatedContent };
            return {
              history: newHistory,
              state: firstToken ? "generating" : state.state
            };
          });
          firstToken = false;
        },
        onDone: ({ tokensPerSecond }) => set({ tokensPerSecond })
      });

      set({ state: "ready", connectionStatus: "connected" });
      focusComposerImpl?.();
      playResponseComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Ollama error.";
      set((state) => ({
        history: state.history.map((entry) =>
          entry.id === assistantId
            ? { ...entry, content: message.length > 0 ? message : "Unable to reach Ollama." }
            : entry
        ),
        state: "offline",
        connectionStatus: "offline"
      }));
    }
  }
}));
