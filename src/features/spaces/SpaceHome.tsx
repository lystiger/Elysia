import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  Cpu,
  FolderTree,
  LoaderCircle,
  MessageSquarePlus,
  Pencil,
  ScanSearch,
  Sparkles,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { GENERAL_SPACE_ID } from "../../domain/space/space";
import { useSpaceStore } from "../../state/spaceStore";
import { SpaceIcon } from "./SpaceIcon";
import { useSpace, useSpaceActions } from "./SpaceContext";
import { formatRelativeTime } from "./format";

export function SpaceHome() {
  const {
    activeSpace,
    spaceConversations,
    stats,
    suggestions,
    greeting,
    effectiveModel
  } = useSpace();
  const { openConversation, newChat, startSuggestion, injectFolderContext, removeSpace } =
    useSpaceActions();
  const renameSpace = useSpaceStore((state) => state.renameSpace);
  const isScanning = useSpaceStore((state) => state.isScanning);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!activeSpace) {
    return null;
  }

  const recentHere = spaceConversations.slice(0, 4);
  const canRemove = activeSpace.id !== GENERAL_SPACE_ID;

  const handleRename = async () => {
    const next = window.prompt("Rename Space", activeSpace.name);
    if (next?.trim()) {
      await renameSpace(activeSpace.id, next);
    }
  };

  const handleInject = async () => {
    const result = await injectFolderContext();
    if (result.ok) {
      toast.success(`Folder context added · ${result.fileCount} files`);
    } else {
      toast.error("Unable to scan this folder");
    }
  };

  const handleRemove = async (mode: "move" | "delete") => {
    await removeSpace(activeSpace.id, mode);
    setConfirmRemove(false);
    toast.success(mode === "move" ? "Space removed; chats moved to General" : "Space and its chats removed");
  };

  return (
    <motion.div
      key={activeSpace.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pointer-events-auto max-h-[58vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-5 shadow-[0_0_60px_-20px_rgba(100,241,255,0.5)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            borderColor: `${activeSpace.color}55`,
            backgroundColor: `${activeSpace.color}1f`,
            color: activeSpace.color
          }}
        >
          <SpaceIcon icon={activeSpace.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-slate-50">{activeSpace.name}</h2>
          <p className="truncate text-sm text-slate-400">{activeSpace.description || greeting}</p>
          {activeSpace.folderPath ? (
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
              <FolderTree className="size-3.5 shrink-0" />
              <span className="truncate">{activeSpace.folderPath}</span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => newChat(activeSpace.id)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-50 transition hover:bg-cyan-300/20"
        >
          <MessageSquarePlus className="size-3.5" /> New chat
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-cyan-200/70" />
          {stats.count} conversation{stats.count === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          {stats.lastActivity ? `active ${formatRelativeTime(stats.lastActivity)}` : "no activity yet"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Cpu className="size-3.5" />
          <span className="text-cyan-200/80">{effectiveModel}</span>
        </span>
      </div>

      {activeSpace.folderPath ? (
        <button
          type="button"
          disabled={isScanning}
          onClick={() => void handleInject()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-300/20 bg-indigo-300/10 px-4 py-2.5 text-sm text-indigo-100 transition hover:bg-indigo-300/15 disabled:cursor-wait disabled:opacity-60"
        >
          {isScanning ? <LoaderCircle className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
          {isScanning ? "Scanning folder metadata…" : "Inject Folder Context"}
        </button>
      ) : null}

      <div className="mt-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">Suggested</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => startSuggestion(suggestion)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-50"
            >
              {suggestion}
              <ArrowRight className="size-3.5 -translate-x-0.5 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {recentHere.length > 0 ? (
        <div className="mt-5 border-t border-white/10 pt-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">Recent conversations</p>
          <div className="flex flex-col gap-0.5">
            {recentHere.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => openConversation(conversation.id)}
                className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/5"
              >
                <span className="truncate text-sm text-slate-200">{conversation.title}</span>
                <span className="shrink-0 text-[10px] text-slate-600">
                  {formatRelativeTime(conversation.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => void handleRename()}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
        >
          <Pencil className="size-3.5" /> Rename
        </button>
        {canRemove ? (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-rose-300/80 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <Trash2 className="size-3.5" /> Remove Space
          </button>
        ) : null}
      </div>

      {confirmRemove ? (
        <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-4">
          <p className="text-sm font-medium text-rose-100">Remove {activeSpace.name}?</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            The local folder will never be changed or deleted. Choose what happens to this Space&apos;s conversations.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleRemove("move")}
              className="rounded-full bg-cyan-300/15 px-3 py-1.5 text-xs text-cyan-50"
            >
              Move chats to General
            </button>
            <button
              type="button"
              onClick={() => void handleRemove("delete")}
              className="rounded-full bg-rose-400/15 px-3 py-1.5 text-xs text-rose-100"
            >
              Delete chats
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              className="rounded-full px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
