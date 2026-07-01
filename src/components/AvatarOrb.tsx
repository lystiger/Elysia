import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

const stateConfig = {
  ready: {
    core: "from-cyan-200/70 via-cyan-400/40 to-slate-900",
    ring: "border-cyan-300/15",
    glow: "shadow-glow-soft",
    particle: "bg-cyan-200/70",
    ringDuration: 26,
    particleDuration: 42,
    glowDuration: 4.5
  },
  thinking: {
    core: "from-violet-200/70 via-violet-400/40 to-slate-900",
    ring: "border-violet-300/25",
    glow: "shadow-glow-violet",
    particle: "bg-violet-200/80",
    ringDuration: 3.2,
    particleDuration: 9,
    glowDuration: 2.2
  },
  generating: {
    core: "from-cyan-100/90 via-cyan-300/60 to-slate-900",
    ring: "border-cyan-200/30",
    glow: "shadow-glow",
    particle: "bg-cyan-100/90",
    ringDuration: 9,
    particleDuration: 15,
    glowDuration: 1.6
  },
  offline: {
    core: "from-slate-400/40 via-slate-500/25 to-slate-900",
    ring: "border-slate-500/15",
    glow: "shadow-glow-red",
    particle: "bg-slate-400/40",
    ringDuration: 60,
    particleDuration: 90,
    glowDuration: 1.1
  }
} as const;

const PARTICLES = [0, 55, 120, 175, 235, 300].map((angle, index) => ({
  angle,
  radius: index % 2 === 0 ? 116 : 104,
  size: index % 3 === 0 ? 3 : 2,
  delay: index * 0.45
}));

export function AvatarOrb() {
  const state = useAssistantStore((store) => store.state);
  const lastContentLength = useAssistantStore((store) => {
    const last = store.history[store.history.length - 1];
    return last?.role === "assistant" ? last.content.length : 0;
  });
  const config = stateConfig[state];
  const coreControls = useAnimationControls();
  const previousLength = useRef(0);

  // Base per-state motion for the energy core: breathing at rest, a tighter
  // idle pulse otherwise. Token pulses (below) layer on top of this.
  useEffect(() => {
    if (state === "ready") {
      void coreControls.start({
        scale: [1, 1.035, 1],
        y: [0, -5, 0]
      }, { duration: 4.5, repeat: Infinity, ease: "easeInOut" });
    } else if (state === "thinking") {
      void coreControls.start({ scale: [1, 1.02, 1], y: 0 }, { duration: 1.5, repeat: Infinity, ease: "easeInOut" });
    } else if (state === "offline") {
      void coreControls.start({ scale: [1, 0.97, 1], y: 0 }, { duration: 1.3, repeat: Infinity, ease: "easeInOut" });
    } else {
      void coreControls.start({ scale: 1, y: 0 }, { duration: 0.3 });
    }
  }, [state, coreControls]);

  // Sync a quick pulse to every streamed token while generating.
  useEffect(() => {
    if (state === "generating" && lastContentLength > previousLength.current) {
      void coreControls.start({ scale: [1, 1.045, 1] }, { duration: 0.3, ease: "easeOut" });
    }
    previousLength.current = lastContentLength;
  }, [lastContentLength, state, coreControls]);

  const particles = useMemo(() => PARTICLES, []);

  return (
    <div className={clsx("relative flex size-64 items-center justify-center", state === "offline" && "grayscale")}>
      {/* Layer 1 — soft ambient radial wash */}
      <div className="pointer-events-none absolute size-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(100,241,255,0.08),_transparent_60%)] blur-3xl" />

      {/* Layer 4 — floating particles (behind the ring/core, orbiting) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: config.particleDuration, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        {particles.map((particle) => (
          <div
            key={particle.angle}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${particle.angle}deg) translate(${particle.radius}px) rotate(-${particle.angle}deg)` }}
          >
            <motion.span
              animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.15, 0.7] }}
              transition={{
                duration: 3 + particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay
              }}
              className={clsx("block rounded-full blur-[0.5px]", config.particle)}
              style={{ width: particle.size, height: particle.size }}
            />
          </div>
        ))}
      </motion.div>

      {/* Layer 3 — rotating translucent ring(s) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: config.ringDuration, repeat: Infinity, ease: "linear" }}
        className={clsx(
          "absolute inset-0 rounded-full border transition-colors duration-1000",
          config.ring,
          state === "thinking" ? "border-2 border-dashed" : "border"
        )}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: config.ringDuration * 1.6, repeat: Infinity, ease: "linear" }}
        className={clsx("absolute size-48 rounded-full border transition-colors duration-1000", config.ring)}
        style={{ opacity: 0.5 }}
      />

      {/* Layer 2 — subtle animated glow */}
      <motion.div
        animate={
          state === "offline"
            ? { opacity: [0.12, 0.25, 0.12] }
            : { opacity: [0.5, 0.78, 0.5] }
        }
        transition={{ duration: config.glowDuration, repeat: Infinity, ease: "easeInOut" }}
        className={clsx("absolute size-52 rounded-full blur-2xl transition-shadow duration-1000", config.glow)}
      />

      {/* Layer 5 — center energy core */}
      <motion.div
        animate={coreControls}
        className="relative flex size-40 items-center justify-center rounded-full bg-slate-900 shadow-inner"
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={state}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className={clsx("absolute inset-0 rounded-full bg-gradient-to-br", config.core)}
          />
        </AnimatePresence>
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: state === "generating" ? 0.9 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative size-3 rounded-full bg-white/90 blur-[1px]"
        />
      </motion.div>
    </div>
  );
}
