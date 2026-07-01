import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, History } from "lucide-react";
import { AvatarOrb } from "../../components/AvatarOrb";
import { recentSessions } from "../sidebar/data";
import { useAssistantStore } from "../../state/assistantStore";

const statusLabel = {
  ready: "Ready",
  thinking: "Thinking",
  generating: "Generating",
  offline: "Offline"
} as const;

const suggestions = ["What can you help me with?", "Summarize what you can do.", "Give me a quick status check."];

const GREETINGS = {
  morning: ["Good morning.", "Good morning. Ready when you are."],
  afternoon: ["Welcome back.", "Welcome back. Local inference is up."],
  evening: ["Good evening.", "Good evening. All quiet on this end."],
  lateNight: ["Still working?", "Still working? I'm here."]
} as const;

function pickGreeting(): string {
  const hour = new Date().getHours();
  const bucket = hour < 5 ? "lateNight" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const options = GREETINGS[bucket];
  const usePlayful = options.length > 1 && Math.random() < 0.25;
  return usePlayful ? options[1] : options[0];
}

export function CompanionStage() {
  const [greeting] = useState(pickGreeting);
  const history = useAssistantStore((store) => store.history);
  const state = useAssistantStore((store) => store.state);
  const activeModel = useAssistantStore((store) => store.activeModel);
  const connectionStatus = useAssistantStore((store) => store.connectionStatus);
  const latencyMs = useAssistantStore((store) => store.latencyMs);
  const toggleHistory = useAssistantStore((store) => store.toggleHistory);
  const seedPrompt = useAssistantStore((store) => store.seedPrompt);

  const lastExchange = history.slice(-2);
  const earlierCount = Math.max(0, history.length - lastExchange.length);
  const lastUser = lastExchange.find((entry) => entry.role === "user");
  const lastAssistant = lastExchange.find((entry) => entry.role === "assistant");
  const recentProject = recentSessions[0];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <AvatarOrb />

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-slate-100">{greeting}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {activeModel} is {connectionStatus === "connected" ? "ready" : connectionStatus === "checking" ? "warming up" : "unreachable"} — local inference{" "}
              {connectionStatus === "connected" ? "online" : "offline"}
              {connectionStatus === "connected" && latencyMs !== null ? ` · ${latencyMs}ms` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => seedPrompt(suggestion)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10 hover:text-cyan-100 hover:shadow-glow-soft active:translate-y-0"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {recentProject ? (
            <button
              type="button"
              onClick={() => seedPrompt(`Continue where we left off on ${recentProject.title}.`)}
              className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 text-xs text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:text-slate-300"
            >
              <History className="size-3.5" />
              Continue {recentProject.title} · {recentProject.relativeTime}
            </button>
          ) : null}
        </motion.div>
      ) : (
        <div className="flex w-full max-w-xl flex-col items-center gap-3 text-center">
          {lastUser ? <p className="text-sm text-slate-400">{lastUser.content}</p> : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={lastAssistant?.id ?? "pending"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 shadow-glow-soft backdrop-blur-xl"
            >
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">{statusLabel[state]}</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">
                {lastAssistant?.content || <span className="text-slate-500">...</span>}
              </p>
            </motion.div>
          </AnimatePresence>

          {earlierCount > 0 ? (
            <button
              type="button"
              onClick={toggleHistory}
              className="flex items-center gap-1 text-xs text-slate-500 transition-colors duration-200 hover:text-slate-300"
            >
              {earlierCount} earlier message{earlierCount === 1 ? "" : "s"}
              <ChevronDown className="size-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
