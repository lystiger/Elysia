import type { LucideIcon } from "lucide-react";

// The legacy sidebar remains available to older shells, but project/session
// data is no longer seeded here. Dynamic data is owned by the Space store.

export type PinnedProject = {
  name: string;
  icon: LucideIcon;
};

export const pinnedProjects: PinnedProject[] = [];

export type RecentSession = {
  title: string;
  relativeTime: string;
  active: boolean;
};

export const recentSessions: RecentSession[] = [];
