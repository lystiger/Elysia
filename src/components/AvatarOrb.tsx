import { motion } from "framer-motion";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

const stateConfig = {
  ready: {
    core: "from-cyan-200/70 via-cyan-400/40 to-slate-900",
    ring: "border-cyan-300/20",
    glow: "shadow-glow-soft"
  },
  thinking: {
    core: "from-violet-200/70 via-violet-400/40 to-slate-900",
    ring: "border-violet-300/30",
    glow: "shadow-glow-violet"
  },
  generating: {
    core: "from-cyan-100/90 via-cyan-300/60 to-slate-900",
    ring: "border-cyan-200/40",
    glow: "shadow-glow"
  },
  offline: {
    core: "from-red-200/60 via-red-400/30 to-slate-900",
    ring: "border-red-300/30",
    glow: "shadow-glow-red"
  }
} as const;

export function AvatarOrb() {
  const state = useAssistantStore((store) => store.state);
  const config = stateConfig[state];

  return (
    <div className="relative flex size-64 items-center justify-center">
      {/* rotating energy ring, most visible while thinking */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: state === "thinking" ? 3.5 : 22, repeat: Infinity, ease: "linear" }}
        className={clsx(
          "absolute inset-0 rounded-full border-2 border-dashed transition-opacity duration-700",
          config.ring,
          state === "thinking" ? "opacity-80" : "opacity-25"
        )}
      />

      {/* ambient outer glow */}
      <motion.div
        animate={
          state === "offline"
            ? { opacity: [0.35, 0.8, 0.35] }
            : { opacity: [0.5, 0.75, 0.5] }
        }
        transition={{
          duration: state === "offline" ? 1.1 : state === "generating" ? 1.8 : 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={clsx("absolute size-52 rounded-full blur-2xl", config.glow)}
      />

      {/* the orb itself: slow breathing at rest, tighter pulse while active */}
      <motion.div
        animate={{
          scale:
            state === "ready"
              ? [1, 1.035, 1]
              : state === "generating"
                ? [1, 1.02, 1]
                : state === "offline"
                  ? [1, 0.97, 1]
                  : 1
        }}
        transition={{
          duration: state === "ready" ? 4.5 : state === "generating" ? 1.4 : 1.1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={clsx(
          "relative flex size-40 items-center justify-center rounded-full bg-gradient-to-br shadow-inner",
          config.core
        )}
      >
        <div className="size-3 rounded-full bg-white/80 blur-[1px]" />
      </motion.div>
    </div>
  );
}
