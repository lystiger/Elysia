import { motion } from "framer-motion";
import clsx from "clsx";
import { Mic, Radio, Sparkle, TriangleAlert } from "lucide-react";
import { useAssistantStore } from "../state/assistantStore";

const stateConfig = {
  idle: {
    label: "Idle",
    ring: "from-cyan-300/20 via-cyan-300/5 to-fuchsia-300/20",
    glow: "shadow-[0_0_40px_rgba(100,241,255,0.1)]",
    icon: Sparkle
  },
  listening: {
    label: "Listening",
    ring: "from-blue-300/50 via-cyan-300/10 to-blue-300/50",
    glow: "shadow-[0_0_60px_rgba(88,166,255,0.2)]",
    icon: Mic
  },
  thinking: {
    label: "Thinking",
    ring: "from-fuchsia-300/45 via-cyan-300/10 to-fuchsia-300/45",
    glow: "shadow-[0_0_70px_rgba(255,127,224,0.15)]",
    icon: Radio
  },
  responding: {
    label: "Responding",
    ring: "from-cyan-200/60 via-sky-300/10 to-cyan-100/60",
    glow: "shadow-[0_0_80px_rgba(100,241,255,0.25)]",
    icon: Sparkle
  },
  error: {
    label: "Error",
    ring: "from-red-300/60 via-red-300/10 to-red-300/60",
    glow: "shadow-[0_0_60px_rgba(255,95,115,0.2)]",
    icon: TriangleAlert
  }
} as const;

export function AvatarStage() {
  const state = useAssistantStore((store) => store.state);
  const avatarUrl = useAssistantStore((store) => store.avatarUrl);
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div className="relative flex min-h-[32rem] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.01))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(100,241,255,0.12),_transparent_40%)]" />
      <motion.div
        animate={state === "thinking" ? { rotate: 360 } : { rotate: 0 }}
        transition={state === "thinking" ? { duration: 8, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}
        className={clsx(
          "absolute h-[21rem] w-[21rem] rounded-full bg-gradient-to-br blur-sm",
          config.ring,
          config.glow
        )}
      />

      <motion.div
        animate={{
          scale: state === "responding" ? 1.04 : state === "listening" ? 1.02 : 1,
          y: state === "idle" ? [0, -8, 0] : 0
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.45 }
        }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 p-4 shadow-2xl">
          <img
            src={avatarUrl}
            alt="Elysia avatar"
            className="h-full w-full rounded-full object-cover"
          />
          <div className="absolute -bottom-3 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm text-slate-100 backdrop-blur">
            {config.label}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          <Icon className="size-4 text-cyan-200" />
          Visual state reactor online
        </div>
      </motion.div>
    </div>
  );
}
