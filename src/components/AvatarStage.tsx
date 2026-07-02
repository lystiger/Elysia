import { motion } from "framer-motion";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";
import { AvatarOrb } from "./AvatarOrb";

const stateConfig = {
  ready: {
    label: "ready",
    ring: "from-cyan-300/25 via-transparent to-fuchsia-300/25",
    glow: "rgba(100,241,255,0.18)"
  },
  idle: {
    label: "idle",
    ring: "from-cyan-300/25 via-transparent to-fuchsia-300/25",
    glow: "rgba(100,241,255,0.18)"
  },
  listening: {
    label: "listening",
    ring: "from-sky-300/50 via-cyan-300/10 to-sky-300/50",
    glow: "rgba(88,166,255,0.4)"
  },
  thinking: {
    label: "thinking",
    ring: "from-fuchsia-400/50 via-cyan-300/10 to-fuchsia-400/50",
    glow: "rgba(255,127,224,0.38)"
  },
  responding: {
    label: "responding",
    ring: "from-cyan-200/60 via-sky-300/15 to-cyan-100/60",
    glow: "rgba(100,241,255,0.45)"
  },
  generating: {
    label: "responding",
    ring: "from-cyan-200/60 via-sky-300/15 to-cyan-100/60",
    glow: "rgba(100,241,255,0.45)"
  },
  focused: {
    label: "focused",
    ring: "from-indigo-400/50 via-cyan-400/10 to-indigo-400/50",
    glow: "rgba(99,102,241,0.35)"
  },
  paused: {
    label: "paused",
    ring: "from-slate-500/40 via-slate-400/10 to-slate-500/40",
    glow: "rgba(148,163,184,0.25)"
  },
  error: {
    label: "error",
    ring: "from-rose-400/60 via-rose-300/10 to-rose-400/60",
    glow: "rgba(255,95,115,0.4)"
  },
  offline: {
    label: "offline",
    ring: "from-slate-500/40 via-rose-300/10 to-slate-500/40",
    glow: "rgba(255,95,115,0.25)"
  }
} as const;

export function AvatarStage() {
  const state = useAssistantStore((store) => store.state);
  const config = stateConfig[state];

  const isThinking = state === "thinking";
  const isActive = state === "listening" || state === "responding";

  return (
    <div className="pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* ambient state glow */}
      <motion.div
        aria-hidden
        className="absolute h-[46rem] w-[46rem] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${config.glow}, transparent 60%)` }}
        animate={{
          scale: isActive ? [1, 1.09, 1] : [1, 1.03, 1],
          opacity: state === "idle" ? 0.65 : 1
        }}
        transition={{ scale: { duration: isActive ? 2.4 : 6, repeat: Infinity, ease: "easeInOut" } }}
      />

      {/* rotating / pulsing gradient ring */}
      <motion.div
        aria-hidden
        className={clsx("absolute h-[26rem] w-[26rem] rounded-full bg-gradient-to-br blur-md", config.ring)}
        animate={{
          rotate: isThinking ? 360 : 0,
          scale: state === "responding" ? [1, 1.05, 1] : 1
        }}
        transition={{
          rotate: isThinking ? { duration: 6, repeat: Infinity, ease: "linear" } : { duration: 0.6 },
          scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* avatar core */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-5"
        animate={{
          y: state === "idle" ? [0, -12, 0] : 0,
          scale: state === "responding" ? 1.03 : state === "listening" ? 1.015 : 1
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.5 }
        }}
      >
        <div
          className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/15 bg-slate-950/60 p-3 backdrop-blur"
          style={{ boxShadow: `0 0 90px -10px ${config.glow}` }}
        >
          <AvatarOrb />
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.5em] text-slate-300 backdrop-blur">
          {config.label}
        </span>
      </motion.div>
    </div>
  );
}
