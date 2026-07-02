import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

function ThinkingDots() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-cyan-200"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function CurrentDialogue() {
  const history = useAssistantStore((state) => state.history);
  const state = useAssistantStore((store) => store.state);

  const latestAssistant = [...history].reverse().find((entry) => entry.role === "assistant");
  const text = latestAssistant?.content ?? "";
  const isThinking = state === "thinking" && text.length === 0;
  const isError = state === "error";
  const hasContent = text.length > 0 || isThinking || isError;

  return (
    <div className="pointer-events-none flex w-full justify-center px-2">
      <AnimatePresence mode="wait">
        {hasContent ? (
          <motion.div
            key={isThinking ? "thinking" : latestAssistant?.id ?? "dialogue"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={clsx(
              "scrollbar-thin pointer-events-auto max-h-[34vh] w-full max-w-2xl overflow-y-auto rounded-3xl border px-6 py-4 backdrop-blur-xl",
              isError
                ? "border-rose-400/30 bg-rose-500/10 shadow-[0_0_50px_-10px_rgba(255,95,115,0.4)]"
                : "border-white/10 bg-white/[0.06] shadow-[0_0_50px_-14px_rgba(100,241,255,0.5)]"
            )}
          >
            {isThinking ? (
              <ThinkingDots />
            ) : (
              <p
                className={clsx(
                  "whitespace-pre-wrap text-left text-[15px] leading-relaxed",
                  isError ? "text-rose-100" : "text-slate-100"
                )}
              >
                {text}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-sm text-slate-400"
          >
            I&apos;m here. Press <span className="text-cyan-200">T</span> and tell me anything.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
