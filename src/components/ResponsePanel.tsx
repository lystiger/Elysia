import { Bot, UserRound } from "lucide-react";
import { useAssistantStore } from "../state/assistantStore";

export function ResponsePanel() {
  const history = useAssistantStore((state) => state.history);
  const state = useAssistantStore((store) => store.state);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Session Feed</p>
          <p className="mt-1 text-sm text-slate-300">Live response stream with minimal, local-only orchestration.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          {history.length} messages
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {history.map((entry) => (
          <article
            key={entry.id}
            className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
              {entry.role === "user" ? <UserRound className="size-4" /> : <Bot className="size-4" />}
              <span>{entry.role}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{entry.content}</p>
          </article>
        ))}

        {history.length === 0 ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] text-center text-sm text-slate-400">
            Start a local conversation. The first response will stream into this panel.
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
        Current pipeline state: <span className="font-medium capitalize text-white">{state}</span>
      </div>
    </div>
  );
}
