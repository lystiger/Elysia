// Workspace domain model.
//
// A workspace is a "project environment" that owns a set of conversations and
// carries its own identity (icon, colour), preferred model, and contextual
// suggestions. The shape is intentionally extensible: future phases can hang
// documents, images, code, memory, and tasks off a workspace without changing
// the conversation contract.

export const DEFAULT_MODEL = "gemma4:e4b";
export const GENERAL_WORKSPACE_ID = "general";

// Icons support emoji, Lucide icon names, and raw SVG so a workspace can be
// personalised. Custom uploaded images are a future addition (kind: "image").
export type WorkspaceIcon =
  | { kind: "emoji"; value: string }
  | { kind: "lucide"; value: string }
  | { kind: "svg"; value: string };

export type Workspace = {
  id: string;
  name: string;
  description: string;
  icon: WorkspaceIcon;
  color: string;
  preferredModel: string | null;
  suggestions: string[];
  pinned: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type CreateWorkspaceInput = {
  name: string;
  description?: string;
  icon?: WorkspaceIcon;
  color?: string;
  preferredModel?: string | null;
  suggestions?: string[];
};

export const WORKSPACE_COLORS = [
  "#64f1ff",
  "#58a6ff",
  "#a78bfa",
  "#34d399",
  "#ff7fe0",
  "#fbbf24",
  "#fb7185"
] as const;

const DEFAULT_SUGGESTIONS = [
  "What can you help me with?",
  "Summarize this for me",
  "Draft a quick message"
];

export function createWorkspace(input: CreateWorkspaceInput): Workspace {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled",
    description: input.description?.trim() ?? "",
    icon: input.icon ?? { kind: "emoji", value: "🗂️" },
    color: input.color ?? WORKSPACE_COLORS[0],
    preferredModel: input.preferredModel ?? DEFAULT_MODEL,
    suggestions: input.suggestions ?? DEFAULT_SUGGESTIONS,
    pinned: false,
    order: now,
    createdAt: now,
    updatedAt: now
  };
}

export function touchWorkspace(workspace: Workspace, patch: Partial<Workspace>): Workspace {
  return { ...workspace, ...patch, updatedAt: Date.now() };
}

// First-run seed. These mirror the maker's real projects so the app opens like
// an operating system for their work, not an empty chat log.
export function defaultWorkspaces(): Workspace[] {
  const now = Date.now();
  const make = (
    id: string,
    name: string,
    description: string,
    icon: WorkspaceIcon,
    color: string,
    suggestions: string[],
    order: number,
    preferredModel: string | null = DEFAULT_MODEL
  ): Workspace => ({
    id,
    name,
    description,
    icon,
    color,
    preferredModel,
    suggestions,
    pinned: order === 0,
    order,
    createdAt: now,
    updatedAt: now
  });

  return [
    make(
      GENERAL_WORKSPACE_ID,
      "General",
      "Everyday conversations",
      { kind: "lucide", value: "MessageCircle" },
      "#64f1ff",
      DEFAULT_SUGGESTIONS,
      0
    ),
    make(
      crypto.randomUUID(),
      "AOI",
      "Automated optical inspection",
      { kind: "lucide", value: "ScanEye" },
      "#58a6ff",
      ["Continue AOI evaluation", "Explain a PCB defect", "Review the FastAPI endpoint"],
      1
    ),
    make(
      crypto.randomUUID(),
      "Computer Architecture",
      "Systems & hardware study",
      { kind: "lucide", value: "Cpu" },
      "#a78bfa",
      ["Explain cache coherence", "Quiz me on pipelining", "Continue my notes"],
      2
    ),
    make(
      crypto.randomUUID(),
      "SignGlove",
      "Sign-language glove project",
      { kind: "lucide", value: "Hand" },
      "#34d399",
      ["Review the firmware", "Debug sensor calibration", "Plan the next milestone"],
      3
    ),
    make(
      crypto.randomUUID(),
      "Elysia",
      "This companion",
      { kind: "lucide", value: "Sparkles" },
      "#ff7fe0",
      ["Plan the next feature", "Review this component", "Refactor for clarity"],
      4
    ),
    make(
      crypto.randomUUID(),
      "Research",
      "Reading & synthesis",
      { kind: "lucide", value: "BookOpen" },
      "#fbbf24",
      ["Summarize a paper", "Compare two approaches", "Draft an outline"],
      5
    )
  ];
}

export function greetingFor(workspace: Workspace): string {
  const hour = new Date().getHours();
  const part =
    hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part} — you're in ${workspace.name}`;
}
