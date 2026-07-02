import { create } from "zustand";
import { toast } from "react-hot-toast";

export type Goal = {
  id: string;
  title: string;
  category: "daily" | "long-term";
  status: "active" | "completed" | "archived";
  priority: "low" | "medium" | "high";
  createdAt: number;
};

export type FocusSession = {
  id: string;
  title: string;
  objective: string;
  startTime: number;
  durationMinutes: number;
  status: "active" | "paused" | "completed" | "cancelled";
  elapsedSeconds: number;
};

type ProductivityStore = {
  goals: Goal[];
  activeSession: FocusSession | null;
  isLoading: boolean;

  // Goal Actions
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "status">) => Promise<void>;
  toggleGoalStatus: (id: string) => Promise<void>;

  // Focus Session Actions
  startSession: (title: string, objective: string, duration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<void>;
  tickSession: () => void;
};

export const useProductivityStore = create<ProductivityStore>((set, get) => ({
  goals: [],
  activeSession: null,
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true });
    const data = (await window.elysiaDesktop.memory.read("goals.json")) as Goal[] | null;
    set({ goals: data || [], isLoading: false });
  },

  addGoal: async (goalData) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      status: "active",
      createdAt: Date.now(),
    };
    const nextGoals = [...get().goals, newGoal];
    await window.elysiaDesktop.memory.write("goals.json", nextGoals);
    set({ goals: nextGoals });
  },

  toggleGoalStatus: async (id) => {
    const nextGoals = get().goals.map((g) =>
      g.id === id
        ? { ...g, status: (g.status === "completed" ? "active" : "completed") as Goal["status"] }
        : g
    );
    await window.elysiaDesktop.memory.write("goals.json", nextGoals);
    set({ goals: nextGoals });
  },

  startSession: (title, objective, duration) => {
    set({
      activeSession: {
        id: crypto.randomUUID(),
        title,
        objective,
        startTime: Date.now(),
        durationMinutes: duration,
        status: "active",
        elapsedSeconds: 0,
      },
    });
  },

  pauseSession: () => {
    set((state) => ({
      activeSession: state.activeSession ? { ...state.activeSession, status: "paused" } : null,
    }));
  },

  resumeSession: () => {
    set((state) => ({
      activeSession: state.activeSession ? { ...state.activeSession, status: "active" } : null,
    }));
  },

  endSession: async () => {
    const session = get().activeSession;
    if (!session) return;

    const completedSession = { ...session, status: "completed" as const };
    set({ activeSession: completedSession });

    // 1. Notify (Native + Fallback Toast)
    void window.elysiaDesktop.notify("Session Complete", `Objective: ${session.objective}`);
    toast.success(`Session Complete: ${session.objective}`, {
      duration: 5000,
      icon: "🎯",
    });

    // 2. Trigger summary in background
    try {
      const summaryFileName = `summary-${session.id}.json`;
      await window.elysiaDesktop.memory.write(`summaries/${summaryFileName}`, {
        ...completedSession,
        completedAt: Date.now(),
      });
    } catch (e) {
      console.error("Failed to save session summary", e);
    }
  },

  tickSession: () => {
    const session = get().activeSession;
    if (session && session.status === "active") {
      set({
        activeSession: {
          ...session,
          elapsedSeconds: session.elapsedSeconds + 1,
        },
      });

      // Auto-complete if time is up
      if (session.elapsedSeconds + 1 >= session.durationMinutes * 60) {
        void get().endSession();
      }
    }
  },
}));
