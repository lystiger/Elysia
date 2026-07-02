// Space domain model.
//
// A Space is a user-created context container that MAY be bound to a local
// folder. Nothing here is hardcoded to a specific project — only the General
// Space is seeded, and it never binds a folder and can never be removed. Real
// project Spaces are created by the user at runtime.

export const DEFAULT_MODEL = "gemma4:e4b";
export const GENERAL_SPACE_ID = "general";

export type SpaceIcon =
  | { kind: "emoji"; value: string }
  | { kind: "lucide"; value: string }
  | { kind: "svg"; value: string };

export type Space = {
  id: string;
  name: string;
  description: string;
  icon: SpaceIcon;
  color: string;
  folderPath: string | null;
  preferredModel: string | null;
  suggestions: string[];
  isPinned: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
};

export type CreateSpaceInput = {
  name: string;
  description?: string;
  icon?: SpaceIcon;
  color?: string;
  folderPath?: string | null;
  preferredModel?: string | null;
  suggestions?: string[];
};

export const SPACE_COLORS = [
  "#64f1ff",
  "#58a6ff",
  "#a78bfa",
  "#34d399",
  "#ff7fe0",
  "#fbbf24",
  "#fb7185"
] as const;

const GENERAL_SUGGESTIONS = [
  "What can you help me with?",
  "Summarize this for me",
  "Draft a quick message"
];

const FOLDER_SUGGESTIONS = [
  "Give me an overview of this project",
  "What should I work on next?",
  "Explain the architecture"
];

const MANUAL_SUGGESTIONS = ["Help me get started", "Give me some ideas", "Make a plan"];

export function defaultSuggestions(hasFolder: boolean): string[] {
  return hasFolder ? FOLDER_SUGGESTIONS : MANUAL_SUGGESTIONS;
}

export function pickColor(index: number): string {
  return SPACE_COLORS[index % SPACE_COLORS.length] ?? SPACE_COLORS[0];
}

// Derives a Space name from a folder path, handling both `/` and `\` separators.
export function folderName(folderPath: string): string {
  const trimmed = folderPath.replace(/[\\/]+$/, "");
  const parts = trimmed.split(/[\\/]/);
  return parts[parts.length - 1] || folderPath;
}

export function createSpace(input: CreateSpaceInput): Space {
  const now = Date.now();
  const folderPath = input.folderPath ?? null;
  return {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled",
    description: input.description?.trim() ?? "",
    icon: input.icon ?? (folderPath ? { kind: "lucide", value: "Folder" } : { kind: "emoji", value: "🗂️" }),
    color: input.color ?? SPACE_COLORS[0],
    folderPath,
    // preferredModel defaults to null so a Space without an explicit choice
    // keeps whatever model is currently in use (see model behavior).
    preferredModel: input.preferredModel ?? null,
    suggestions: input.suggestions ?? defaultSuggestions(Boolean(folderPath)),
    isPinned: false,
    order: now,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  };
}

export function touchSpace(space: Space, patch: Partial<Space>): Space {
  return { ...space, ...patch, updatedAt: Date.now() };
}

// The one and only seeded Space. Always present, never a folder, never removed.
export function generalSpace(): Space {
  const now = Date.now();
  return {
    id: GENERAL_SPACE_ID,
    name: "General",
    description: "Everyday conversations",
    icon: { kind: "lucide", value: "MessageCircle" },
    color: "#64f1ff",
    folderPath: null,
    preferredModel: DEFAULT_MODEL,
    suggestions: GENERAL_SUGGESTIONS,
    isPinned: true,
    order: 0,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  };
}

export function defaultSpaces(): Space[] {
  return [generalSpace()];
}

export function greetingFor(space: Space): string {
  const hour = new Date().getHours();
  const part =
    hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part} — you're in ${space.name}`;
}
