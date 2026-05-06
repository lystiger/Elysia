import { create } from "zustand";
import { streamFromOllama } from "../services/ollama";
import avatarShell from "../assets/avatar-shell.svg";

export type AssistantState = "idle" | "listening" | "thinking" | "responding" | "error";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AssistantStore = {
  activeModel: string;
  appVersion: string;
  avatarUrl: string;
  history: Message[];
  state: AssistantState;
  setActiveModel: (model: string) => void;
  setState: (state: AssistantState) => void;
  setAppVersion: (version: string) => void;
  focusComposer: (fn: () => void) => void;
  sendPrompt: (prompt: string) => Promise<void>;
};

let focusComposerImpl: (() => void) | null = null;

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  activeModel: "qwen3:8b",
  appVersion: "",
  avatarUrl: avatarShell,
  history: [],
  state: "idle",
  setActiveModel: (activeModel) => set({ activeModel }),
  setState: (state) => set({ state }),
  setAppVersion: (appVersion) => set({ appVersion }),
  focusComposer: (fn) => {
    focusComposerImpl = fn;
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

      await streamFromOllama({
        model: get().activeModel,
        prompt,
        onToken: (token) => {
          set((state) => ({
            history: state.history.map((entry) =>
              entry.id === assistantId
                ? { ...entry, content: `${entry.content}${token}` }
                : entry
            ),
            state: firstToken ? "responding" : state.state
          }));
          firstToken = false;
        }
      });

      set({ state: "idle" });
      focusComposerImpl?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Ollama error.";
      set((state) => ({
        history: state.history.map((entry) =>
          entry.id === assistantId
            ? { ...entry, content: message.length > 0 ? message : "Unable to reach Ollama." }
            : entry
        ),
        state: "error"
      }));
    }
  }
}));
