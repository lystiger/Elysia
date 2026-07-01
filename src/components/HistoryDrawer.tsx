import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, UserRound } from "lucide-react";
import { useAssistantStore } from "../state/assistantStore";

export function HistoryDrawer() {
  const historyOpen = useAssistantStore((store) => store.historyOpen);
  const history = useAssistantStore((store) => store.history);
  const toggleHistory = useAssistantStore((store) => store.toggleHistory);

  return (
    <AnimatePresence>
      {historyOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleHistory}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col gap-4 border-l border-white/10 bg-[#070c1a]/95 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">This session</p>
              <button
                type="button"
                onClick={toggleHistory}
                className="flex size-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-all duration-200 hover:scale-105 hover:bg-white/5 hover:text-slate-100 active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
              {history.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                    {entry.role === "user" ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}
                    <span>{entry.role === "user" ? "You" : "Elysia"}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{entry.content}</p>
                </article>
              ))}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
