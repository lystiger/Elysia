import clsx from "clsx";
import { selectSession } from "../conversations/selectSession";
import { useConversationStore } from "../../state/conversationStore";
import { formatRelativeTime } from "../../utils/time";

export function SessionList() {
  const sessions = useConversationStore((store) => store.sessions);
  const activeConversationId = useConversationStore((store) => store.activeConversationId);

  if (sessions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 px-3 py-3 text-xs text-slate-500">
        No recent sessions yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {sessions.map((session) => {
        const isActive = session.id === activeConversationId;
        return (
          <li key={session.id}>
            <button
              type="button"
              onClick={() => void selectSession(session)}
              className={clsx(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200 hover:translate-x-0.5 hover:bg-white/5",
                isActive && "bg-white/5"
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={clsx("size-1.5 shrink-0 rounded-full", isActive ? "bg-cyan-300" : "bg-slate-600")} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-slate-200">{session.title}</span>
                  <span className="block truncate text-[11px] text-slate-500">{session.model}</span>
                </span>
              </span>
              <span className="shrink-0 text-xs text-slate-500">{formatRelativeTime(session.updatedAt)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
