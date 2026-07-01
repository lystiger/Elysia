import { Bot, Sparkles, UserRound } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

export function ResponsePanel() {
  const history = useAssistantStore((state) => state.history);
  const activeModel = useAssistantStore((state) => state.activeModel);

  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Sparkles className="size-6 text-accent-cyan" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-slate-100">How can I help you today?</h2>
        <p className="text-sm text-slate-400">
          Talking to <span className="text-cyan-200">{activeModel}</span> over your local Ollama instance.
        </p>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin mx-auto w-full max-w-3xl flex-1 space-y-1 overflow-y-auto">
      {history.map((entry) => (
        <article
          key={entry.id}
          className={clsx(
            "flex gap-4 rounded-2xl px-4 py-4",
            entry.role === "assistant" && "bg-white/[0.03]"
          )}
        >
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30">
            {entry.role === "user" ? (
              <UserRound className="size-4 text-slate-300" />
            ) : (
              <Bot className="size-4 text-cyan-200" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
              {entry.role === "user" ? "You" : "Elysia"}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">
              {entry.content || (
                <span className="text-slate-500">...</span>
              )}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
