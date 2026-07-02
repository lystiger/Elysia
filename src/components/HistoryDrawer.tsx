import { useEffect, useRef } from "react";
import { Bot, UserRound, X } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

type HistoryDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const history = useAssistantStore((state) => state.history);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, history]);

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
          "fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#070b18]/95 backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-[105%]"
        )}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Conversation</p>
            <p className="text-xs text-slate-500">{history.length} messages · local only</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {history.length === 0 ? (
            <div className="flex h-full min-h-40 items-center justify-center px-6 text-center text-sm text-slate-500">
              Nothing yet. Your conversation with Elysia will appear here.
            </div>
          ) : (
            history.map((entry) => (
              <article
                key={entry.id}
                className={clsx(
                  "rounded-2xl border px-4 py-3",
                  entry.role === "user"
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-cyan-300/15 bg-cyan-300/[0.04]"
                )}
              >
                <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {entry.role === "user" ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}
                  <span>{entry.role === "user" ? "You" : "Elysia"}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{entry.content}</p>
              </article>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
