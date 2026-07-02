import { motion } from "framer-motion";
import { ArrowRight, Clock3, Cpu, MessageSquarePlus, Sparkles } from "lucide-react";
import { useWorkspace, useWorkspaceActions } from "./WorkspaceContext";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { formatRelativeTime } from "./format";

// The workspace landing page: greeting, recent activity, contextual suggestions,
// and recent conversations for the active project. Shown in the companion stage
// whenever no conversation is open.
export function WorkspaceHome() {
  const {
    activeWorkspace,
    workspaceConversations,
    stats,
    suggestions,
    greeting,
    effectiveModel
  } = useWorkspace();
  const { openConversation, newChat, startSuggestion } = useWorkspaceActions();

  if (!activeWorkspace) {
    return null;
  }

  const recentHere = workspaceConversations.slice(0, 4);

  return (
    <motion.div
      key={activeWorkspace.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pointer-events-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-5 shadow-[0_0_60px_-20px_rgba(100,241,255,0.5)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            borderColor: `${activeWorkspace.color}55`,
            backgroundColor: `${activeWorkspace.color}1f`,
            color: activeWorkspace.color
          }}
        >
          <WorkspaceIcon icon={activeWorkspace.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-slate-50">{activeWorkspace.name}</h2>
          <p className="truncate text-sm text-slate-400">{activeWorkspace.description || greeting}</p>
        </div>
        <button
          type="button"
          onClick={() => newChat(activeWorkspace.id)}
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
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">Continue</p>
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
    </motion.div>
  );
}
