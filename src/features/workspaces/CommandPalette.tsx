import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import {
  Brain,
  CornerDownLeft,
  Cpu,
  Eye,
  FolderTree,
  MessageSquarePlus,
  Mic,
  Search,
  Settings
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { useWorkspace, useWorkspaceActions } from "./WorkspaceContext";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { useWorkspaceStore } from "../../state/workspaceStore";
import { useAssistantStore } from "../../state/assistantStore";
import { DEFAULT_MODEL } from "../../domain/workspace/workspace";
import { conversationMatches } from "../../domain/conversation/conversation";

type Mode = "root" | "workspaces" | "models";

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
};

const MODEL_PRESETS = ["gemma4:e4b", "qwen3:8b", "llama3.1:8b", "deepseek-r1:8b", "phi3:mini"];

// The future-phase capabilities surface as disabled hints so the command
// surface reads like an operating system, not a finished feature set.
const COMING_SOON: { label: string; icon: ReactNode }[] = [
  { label: "Memory", icon: <Brain className="size-4" /> },
  { label: "Voice", icon: <Mic className="size-4" /> },
  { label: "Vision", icon: <Eye className="size-4" /> }
];

export function CommandPalette() {
  const open = useWorkspaceStore((state) => state.commandPaletteOpen);
  const toggle = useWorkspaceStore((state) => state.toggleCommandPalette);
  const setWorkspaceModel = useWorkspaceStore((state) => state.setWorkspaceModel);
  const availableModels = useAssistantStore((state) => state.availableModels);

  const { workspaces, conversations, recent, activeWorkspace, activeWorkspaceId, effectiveModel } =
    useWorkspace();
  const { newChat, switchWorkspace, openConversation } = useWorkspaceActions();

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("root");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = () => toggle(false);

  useEffect(() => {
    if (open) {
      setQuery("");
      setMode("root");
      setSelected(0);
      // Focus after the panel mounts.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query, mode]);

  const models = useMemo(() => {
    const set = new Set<string>([effectiveModel, ...availableModels, ...MODEL_PRESETS, DEFAULT_MODEL]);
    return [...set].filter((m) => m.trim().length > 0);
  }, [availableModels, effectiveModel]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (label: string) => q.length === 0 || label.toLowerCase().includes(q);

    if (mode === "workspaces") {
      return workspaces
        .filter((w) => matches(w.name))
        .map((w) => ({
          id: `ws-${w.id}`,
          label: w.name,
          hint: w.description || "Workspace",
          icon: <WorkspaceIcon icon={w.icon} className="size-4" />,
          run: () => {
            switchWorkspace(w.id);
            close();
          }
        }));
    }

    if (mode === "models") {
      return models
        .filter((model) => matches(model))
        .map((model) => ({
          id: `model-${model}`,
          label: model,
          hint: model === effectiveModel ? "current" : undefined,
          icon: <Cpu className="size-4" />,
          run: () => {
            setWorkspaceModel(activeWorkspaceId, model);
            toast.success(`Model set to ${model}`);
            close();
          }
        }));
    }

    const commands: Item[] = [
      {
        id: "cmd-new",
        label: "New Chat",
        hint: activeWorkspace ? `in ${activeWorkspace.name}` : undefined,
        icon: <MessageSquarePlus className="size-4" />,
        run: () => {
          newChat();
          close();
        }
      },
      {
        id: "cmd-switch",
        label: "Switch Workspace",
        hint: "Choose a project",
        icon: <FolderTree className="size-4" />,
        run: () => setMode("workspaces")
      },
      {
        id: "cmd-model",
        label: "Change Model",
        hint: effectiveModel,
        icon: <Cpu className="size-4" />,
        run: () => setMode("models")
      },
      {
        id: "cmd-settings",
        label: "Open Settings",
        hint: "Preferences",
        icon: <Settings className="size-4" />,
        run: () => {
          close();
          toast("Settings are coming soon", { icon: "⚙️" });
        }
      }
    ].filter((command) => matches(command.label));

    if (q.length === 0) {
      const recentItems: Item[] = recent.slice(0, 6).map((conversation) => ({
        id: `recent-${conversation.id}`,
        label: conversation.title,
        hint: workspaces.find((w) => w.id === conversation.workspaceId)?.name ?? "Conversation",
        icon: <Search className="size-4" />,
        run: () => {
          openConversation(conversation.id);
          close();
        }
      }));
      return [...commands, ...recentItems];
    }

    const workspaceHits: Item[] = workspaces
      .filter((w) => matches(w.name))
      .map((w) => ({
        id: `hit-ws-${w.id}`,
        label: w.name,
        hint: "Workspace",
        icon: <WorkspaceIcon icon={w.icon} className="size-4" />,
        run: () => {
          switchWorkspace(w.id);
          close();
        }
      }));

    const conversationHits: Item[] = conversations
      .filter((conversation) => conversationMatches(conversation, q))
      .slice(0, 8)
      .map((conversation) => ({
        id: `hit-conv-${conversation.id}`,
        label: conversation.title,
        hint: workspaces.find((w) => w.id === conversation.workspaceId)?.name ?? "Conversation",
        icon: <Search className="size-4" />,
        run: () => {
          openConversation(conversation.id);
          close();
        }
      }));

    return [...commands, ...workspaceHits, ...conversationHits];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mode, workspaces, conversations, recent, models, activeWorkspace, activeWorkspaceId, effectiveModel]);

  if (!open) {
    return null;
  }

  const activeIndex = items.length === 0 ? 0 : Math.min(selected, items.length - 1);

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((prev) => (items.length === 0 ? 0 : (prev + 1) % items.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((prev) => (items.length === 0 ? 0 : (prev - 1 + items.length) % items.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      items[activeIndex]?.run();
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (mode !== "root") {
        setMode("root");
        setQuery("");
      } else {
        close();
      }
    }
  };

  const showComingSoon = mode === "root" && query.trim().length === 0;
  const placeholder =
    mode === "workspaces"
      ? "Jump to a workspace…"
      : mode === "models"
        ? "Set the model for this workspace…"
        : "Search conversations, workspaces, or run a command…";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1f]/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          {mode === "root" ? (
            <Search className="size-4 shrink-0 text-slate-500" />
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("root");
                setQuery("");
              }}
              aria-label="Back"
              className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-slate-400 hover:bg-white/10"
            >
              ←
            </button>
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline">
            Esc
          </kbd>
        </div>

        <div className="scrollbar-thin max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">No matches.</p>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setSelected(index)}
                onClick={() => item.run()}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  index === activeIndex ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-slate-100">{item.label}</span>
                </span>
                {item.hint ? (
                  <span className="shrink-0 truncate text-xs text-slate-500">{item.hint}</span>
                ) : null}
                {index === activeIndex ? (
                  <CornerDownLeft className="size-3.5 shrink-0 text-slate-500" />
                ) : null}
              </button>
            ))
          )}

          {showComingSoon ? (
            <div className="mt-1 border-t border-white/5 pt-1">
              {COMING_SOON.map((row) => (
                <div
                  key={row.label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-600"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                    {row.icon}
                  </span>
                  <span className="flex-1 text-sm">{row.label}</span>
                  <span className="text-[10px] uppercase tracking-widest">Soon</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
