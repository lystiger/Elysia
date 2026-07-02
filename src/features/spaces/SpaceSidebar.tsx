import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Clock,
  Folder,
  MessageSquarePlus,
  Pin,
  Plus,
  Trash2,
  X
} from "lucide-react";
import clsx from "clsx";
import { conversationsForSpace, spaceStats, type Conversation } from "../../domain/conversation/conversation";
import { useSpaceStore } from "../../state/spaceStore";
import { SpaceIcon } from "./SpaceIcon";
import { useSpace, useSpaceActions } from "./SpaceContext";
import { formatRelativeTime } from "./format";

type SpaceSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function ConversationRow({
  conversation,
  active,
  dotColor,
  onOpen
}: {
  conversation: Conversation;
  active: boolean;
  dotColor: string;
  onOpen: () => void;
}) {
  const togglePin = useSpaceStore((state) => state.togglePinConversation);
  const remove = useSpaceStore((state) => state.deleteConversation);

  return (
    <div
      className={clsx(
        "group flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition hover:bg-white/5",
        active && "bg-white/[0.06]"
      )}
    >
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="truncate text-sm text-slate-200">{conversation.title}</span>
      </button>
      <span className="shrink-0 text-[10px] text-slate-600">
        {formatRelativeTime(conversation.updatedAt)}
      </span>
      <button
        type="button"
        onClick={() => togglePin(conversation.id)}
        aria-label={conversation.pinned ? "Unpin conversation" : "Pin conversation"}
        className={clsx(
          "shrink-0 rounded-md p-1 transition hover:bg-white/10",
          conversation.pinned ? "text-cyan-200" : "text-slate-500 opacity-0 group-hover:opacity-100"
        )}
      >
        <Pin className="size-3" />
      </button>
      <button
        type="button"
        onClick={() => remove(conversation.id)}
        aria-label="Delete conversation"
        className="shrink-0 rounded-md p-1 text-slate-500 opacity-0 transition hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}

export function SpaceSidebar({ open, onClose }: SpaceSidebarProps) {
  const { spaces, conversations, activeSpaceId, activeConversationId, pinned, recent } = useSpace();
  const { switchSpace, openConversation, newChat } = useSpaceActions();
  const setCreatorOpen = useSpaceStore((state) => state.setSpaceCreatorOpen);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpanded((previous) => {
      if (previous.has(activeSpaceId)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(activeSpaceId);
      return next;
    });
  }, [activeSpaceId]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const orderedSpaces = useMemo(
    () => [...spaces].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || a.order - b.order),
    [spaces]
  );
  const colorFor = useMemo(() => {
    const map = new Map(spaces.map((space) => [space.id, space.color]));
    return (id: string) => map.get(id) ?? "#64f1ff";
  }, [spaces]);

  const toggleExpanded = (id: string) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const handleOpenConversation = (id: string) => {
    openConversation(id);
    onClose();
  };
  const handleNewChat = (spaceId: string) => {
    newChat(spaceId);
    onClose();
  };
  const handleSwitchSpace = (id: string) => {
    switchSpace(id);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={clsx(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        aria-hidden={!open}
        className={clsx(
          "fixed left-0 top-0 z-40 flex h-full w-full max-w-[21rem] flex-col border-r border-white/10 bg-[#070b18]/95 backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-[105%]"
        )}
      >
        <header className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Spaces</p>
            <p className="text-xs text-slate-500">{spaces.length} context{spaces.length === 1 ? "" : "s"} · local only</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              aria-label="Add Space"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Spaces"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <button
          type="button"
          onClick={() => handleNewChat(activeSpaceId)}
          className="mx-4 mb-2 flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
        >
          <MessageSquarePlus className="size-4" /> New chat
        </button>

        <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-4 py-3">
          {pinned.length > 0 ? (
            <section className="space-y-1">
              <p className="flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                <Pin className="size-3" /> Pinned
              </p>
              {pinned.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeConversationId}
                  dotColor={colorFor(conversation.spaceId)}
                  onOpen={() => handleOpenConversation(conversation.id)}
                />
              ))}
            </section>
          ) : null}

          {recent.length > 0 ? (
            <section className="space-y-1">
              <p className="flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                <Clock className="size-3" /> Recent
              </p>
              {recent.slice(0, 5).map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeConversationId}
                  dotColor={colorFor(conversation.spaceId)}
                  onOpen={() => handleOpenConversation(conversation.id)}
                />
              ))}
            </section>
          ) : null}

          <section className="space-y-1">
            <p className="px-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">All Spaces</p>
            <ul className="flex flex-col gap-0.5">
              {orderedSpaces.map((space) => {
                const list = conversationsForSpace(conversations, space.id);
                const stats = spaceStats(conversations, space.id);
                const isExpanded = expanded.has(space.id);
                const isActive = space.id === activeSpaceId;
                return (
                  <li key={space.id}>
                    <div
                      className={clsx(
                        "flex items-center gap-1 rounded-xl pr-1 transition",
                        isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSwitchSpace(space.id)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-2 text-left"
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: `${space.color}55`,
                            backgroundColor: `${space.color}1a`,
                            color: space.color
                          }}
                        >
                          <SpaceIcon icon={space.icon} className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="block truncate text-sm text-slate-100">{space.name}</span>
                            {space.folderPath ? <Folder className="size-3 shrink-0 text-slate-500" /> : null}
                          </span>
                          <span className="block truncate text-[10px] text-slate-500">
                            {stats.count} chat{stats.count === 1 ? "" : "s"} · opened {formatRelativeTime(space.lastOpenedAt)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(space.id)}
                        aria-label={isExpanded ? "Collapse Space" : "Expand Space"}
                        className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                      >
                        <ChevronRight className={clsx("size-4 transition-transform", isExpanded && "rotate-90")} />
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="mb-1 ml-3.5 flex flex-col gap-0.5 border-l border-white/10 pl-2">
                        <button
                          type="button"
                          onClick={() => handleNewChat(space.id)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                        >
                          <MessageSquarePlus className="size-3.5" /> New chat here
                        </button>
                        {list.length === 0 ? (
                          <p className="px-2 py-1.5 text-xs italic text-slate-600">No conversations yet</p>
                        ) : (
                          list.map((conversation) => (
                            <ConversationRow
                              key={conversation.id}
                              conversation={conversation}
                              active={conversation.id === activeConversationId}
                              dotColor={space.color}
                              onOpen={() => handleOpenConversation(conversation.id)}
                            />
                          ))
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}
