import { create } from "zustand";
import { pingOllama, streamFromOllama } from "../services/ollama";
import { playResponseComplete } from "../services/system/sound";
import type { Message } from "../domain/message/message";

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
  setActiveModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
  setState: (state: AssistantState) => void;
  setAppVersion: (version: string) => void;
  setTyping: (isTyping: boolean) => void;
  setObservedApp: (app: string) => void;
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
  state: "idle",
  isUserTyping: false,
  observedApp: "Desktop",
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
    set({ history: [], state: "idle", historyOpen: false });
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

      set({ state: "idle", connectionStatus: "connected" });
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
        state: "error",
        connectionStatus: "offline"
      }));
    }
  }
}));
