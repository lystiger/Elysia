import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Cpu, FolderPlus, MessageSquarePlus, Search, Shapes } from "lucide-react";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { DEFAULT_MODEL } from "../../domain/space/space";
import { conversationMatches } from "../../domain/conversation/conversation";
import { useAssistantStore } from "../../state/assistantStore";
import { useSpaceStore } from "../../state/spaceStore";
import { SpaceIcon } from "./SpaceIcon";
import { useSpace, useSpaceActions } from "./SpaceContext";

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
};

const MODEL_PRESETS = ["gemma4:e4b", "qwen3:8b", "llama3.1:8b", "deepseek-r1:8b", "phi3:mini"];

export function CommandPalette() {
  const open = useSpaceStore((state) => state.commandPaletteOpen);
  const toggle = useSpaceStore((state) => state.toggleCommandPalette);
  const setSpaceModel = useSpaceStore((state) => state.setSpaceModel);
  const setCreatorOpen = useSpaceStore((state) => state.setSpaceCreatorOpen);
  const availableModels = useAssistantStore((state) => state.availableModels);
  const { spaces, conversations, recent, activeSpace, activeSpaceId, effectiveModel } = useSpace();
  const { newChat, switchSpace, openConversation } = useSpaceActions();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = () => toggle(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    setSelected(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const models = useMemo(
    () => [...new Set([effectiveModel, ...availableModels, ...MODEL_PRESETS, DEFAULT_MODEL])],
    [availableModels, effectiveModel]
  );

  const items = useMemo<Item[]>(() => {
    const normalized = query.trim().toLowerCase();
    const matches = (value: string) => !normalized || value.toLowerCase().includes(normalized);
    const commands: Item[] = [
      {
        id: "new-chat",
        label: "New Chat",
        hint: activeSpace ? `in ${activeSpace.name}` : undefined,
        icon: <MessageSquarePlus className="size-4" />,
        run: () => {
          newChat();
          close();
        }
      },
      {
        id: "add-space",
        label: "Add Space",
        hint: "Folder or manual",
        icon: <FolderPlus className="size-4" />,
        run: () => {
          close();
          setCreatorOpen(true);
        }
      }
    ].filter((item) => matches(item.label));

    const spaceItems: Item[] = spaces
      .filter((space) => matches(space.name))
      .map((space) => ({
        id: `space-${space.id}`,
        label: space.name,
        hint: space.folderPath ? "Bound folder" : "Space",
        icon: <SpaceIcon icon={space.icon} className="size-4" />,
        run: () => {
          switchSpace(space.id);
          close();
        }
      }));

    const conversationItems: Item[] = (normalized ? conversations : recent.slice(0, 6))
      .filter((conversation) => !normalized || conversationMatches(conversation, normalized))
      .map((conversation) => ({
        id: `conversation-${conversation.id}`,
        label: conversation.title,
        hint: spaces.find((space) => space.id === conversation.spaceId)?.name ?? "Conversation",
        icon: <Search className="size-4" />,
        run: () => {
          openConversation(conversation.id);
          close();
        }
      }));

    const modelItems: Item[] = models
      .filter((model) => normalized.length > 0 && matches(model))
      .map((model) => ({
        id: `model-${model}`,
        label: model,
        hint: model === effectiveModel ? "Current model" : "Set for this Space",
        icon: <Cpu className="size-4" />,
        run: () => {
          void setSpaceModel(activeSpaceId, model);
          toast.success(`Model set to ${model}`);
          close();
        }
      }));

    return [...commands, ...spaceItems, ...conversationItems, ...modelItems];
  }, [
    query,
    spaces,
    conversations,
    recent,
    models,
    activeSpace,
    activeSpaceId,
    effectiveModel,
    newChat,
    switchSpace,
    openConversation,
    setSpaceModel,
    setCreatorOpen
  ]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((value) => Math.min(value + 1, Math.max(0, items.length - 1)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((value) => Math.max(0, value - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        items[selected]?.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, selected]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={close}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Search Spaces and conversations"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a1020]/95 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="size-4 text-slate-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Spaces, conversations, or models…"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">Esc</kbd>
        </div>
        <div className="scrollbar-thin max-h-[55vh] overflow-y-auto p-2">
          {items.length ? (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setSelected(index)}
                onClick={item.run}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                  selected === index ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                )}
              >
                <span className="text-cyan-200/80">{item.icon}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{item.label}</span>
                {item.hint ? <span className="truncate text-xs text-slate-500">{item.hint}</span> : null}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
              <Shapes className="size-6" />
              <p className="text-sm">No matching Spaces or conversations</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
