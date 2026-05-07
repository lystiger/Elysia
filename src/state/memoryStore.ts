import { create } from "zustand";

export type UserProfile = {
  preferredTone: string;
  activeProjects: string[];
  currentGoals: string[];
};

type MemoryStore = {
  profile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
};

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  profile: null,
  isLoading: false,
  loadProfile: async () => {
    set({ isLoading: true });
    const data = await window.elysiaDesktop.memory.read("profile.json");
    set({ profile: data || { preferredTone: "calm", activeProjects: [], currentGoals: [] }, isLoading: false });
  },
  updateProfile: async (updates) => {
    const current = get().profile || { preferredTone: "calm", activeProjects: [], currentGoals: [] };
    const next = { ...current, ...updates };
    await window.elysiaDesktop.memory.write("profile.json", next);
    set({ profile: next });
  }
}));
