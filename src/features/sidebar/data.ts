import type { LucideIcon } from "lucide-react";
import { Cpu, Hand, ScanEye, Sparkles } from "lucide-react";

// Presentational placeholders — there's no persistence or multi-project
// backend yet, so these are static rather than sourced from real sessions.

export type PinnedProject = {
  name: string;
  icon: LucideIcon;
};

export const pinnedProjects: PinnedProject[] = [
  { name: "Computer Architecture", icon: Cpu },
  { name: "AOI", icon: ScanEye },
  { name: "SignGlove", icon: Hand },
  { name: "Elysia", icon: Sparkles }
];

export type RecentSession = {
  title: string;
  relativeTime: string;
  active: boolean;
};

export const recentSessions: RecentSession[] = [
  { title: "Computer Architecture", relativeTime: "2 hours ago", active: true },
  { title: "AOI", relativeTime: "Yesterday", active: false },
  { title: "SignGlove", relativeTime: "3 days ago", active: false }
];
