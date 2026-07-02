import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Clock, MessageSquarePlus, Pin, Plus, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { useWorkspace, useWorkspaceActions } from "./WorkspaceContext";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { formatRelativeTime } from "./format";
import { useWorkspaceStore } from "../../state/workspaceStore";
import {
  conversationsForWorkspace,
  workspaceStats,
  type Conversation
} from "../../domain/conversation/conversation";

type WorkspaceSidebarProps = {
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
  const togglePin = useWorkspaceStore((state) => state.togglePinConversation);
  const remove = useWorkspaceStore((state) => state.deleteConversation);

  return (
    <div
      className={clsx(
        "group flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition hover:bg-white/5",
        active && "bg-white/[0.06]"
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
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
          conversation.pinned
            ? "text-cyan-200"
            : "text-slate-500 opacity-0 group-hover:opacity-100"
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

export function WorkspaceSidebar({ open, onClose }: WorkspaceSidebarProps) {
  const { workspaces, conversations, activeWorkspaceId, activeConversationId, pinned, recent } =
    useWorkspace();
  const { switchWorkspace, openConversation, newChat } = useWorkspaceActions();
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpanded((prev) => {
      if (prev.has(activeWorkspaceId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(activeWorkspaceId);
      return next;
    });
  }, [activeWorkspaceId]);

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

  const orderedWorkspaces = useMemo(
    () => [...workspaces].sort((a, b) => a.order - b.order),
    [workspaces]
  );
  const colorFor = useMemo(() => {
    const map = new Map(workspaces.map((w) => [w.id, w.color]));
    return (id: string) => map.get(id) ?? "#64f1ff";
  }, [workspaces]);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
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
  const handleNewChat = (workspaceId: string) => {
    newChat(workspaceId);
    onClose();
  };
  const handleAddWorkspace = () => {
    const workspace = createWorkspace({
      name: "New Workspace",
      icon: { kind: "emoji", value: "🗂️" },
      color: "#a78bfa"
    });
    switchWorkspace(workspace.id);
    setExpanded((prev) => new Set(prev).add(workspace.id));
  };

  const recentTop = recent.slice(0, 5);

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
          "fixed left-0 top-0 z-40 flex h-full w-full max-w-[20rem] flex-col border-r border-white/10 bg-[#070b18]/95 backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-[105%]"
        )}
      >
        <header className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Workspaces</p>
            <p className="text-xs text-slate-500">{workspaces.length} projects · local only</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddWorkspace}
              aria-label="New workspace"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close workspaces"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <button
          type="button"
          onClick={() => handleNewChat(activeWorkspaceId)}
          className="mx-4 mb-2 flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
        >
          <MessageSquarePlus className="size-4" />
          New chat
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
                  dotColor={colorFor(conversation.workspaceId)}
                  onOpen={() => handleOpenConversation(conversation.id)}
                />
              ))}
            </section>
          ) : null}

          {recentTop.length > 0 ? (
            <section className="space-y-1">
              <p className="flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                <Clock className="size-3" /> Recent
              </p>
              {recentTop.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeConversationId}
                  dotColor={colorFor(conversation.workspaceId)}
                  onOpen={() => handleOpenConversation(conversation.id)}
                />
              ))}
            </section>
          ) : null}

          <section className="space-y-1">
            <p className="px-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">All workspaces</p>
            <ul className="flex flex-col gap-0.5">
              {orderedWorkspaces.map((workspace) => {
                const list = conversationsForWorkspace(conversations, workspace.id);
                const stats = workspaceStats(conversations, workspace.id);
                const isExpanded = expanded.has(workspace.id);
                const isActive = workspace.id === activeWorkspaceId;
                return (
                  <li key={workspace.id}>
                    <div
                      className={clsx(
                        "flex items-center gap-1 rounded-xl pr-1 transition",
                        isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => switchWorkspace(workspace.id)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-2 text-left"
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: `${workspace.color}55`,
                            backgroundColor: `${workspace.color}1a`,
                            color: workspace.color
                          }}
                        >
                          <WorkspaceIcon icon={workspace.icon} className="size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-slate-100">{workspace.name}</span>
                          <span className="block truncate text-[10px] text-slate-500">
                            {stats.count} chat{stats.count === 1 ? "" : "s"} ·{" "}
                            {formatRelativeTime(stats.lastActivity)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(workspace.id)}
                        aria-label={isExpanded ? "Collapse workspace" : "Expand workspace"}
                        className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                      >
                        <ChevronRight
                          className={clsx("size-4 transition-transform", isExpanded && "rotate-90")}
                        />
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="mb-1 ml-3.5 flex flex-col gap-0.5 border-l border-white/10 pl-2">
                        <button
                          type="button"
                          onClick={() => handleNewChat(workspace.id)}
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
                              dotColor={workspace.color}
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
