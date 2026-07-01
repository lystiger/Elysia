import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AvatarOrb } from "./AvatarOrb";
import { useAssistantStore } from "../state/assistantStore";

const statusLabel = {
  ready: "Ready",
  thinking: "Thinking",
  generating: "Generating",
  offline: "Offline"
} as const;

const suggestions = ["What can you help me with?", "Summarize what you can do.", "Give me a quick status check."];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

export function CompanionStage() {
  const history = useAssistantStore((store) => store.history);
  const state = useAssistantStore((store) => store.state);
  const activeModel = useAssistantStore((store) => store.activeModel);
  const connectionStatus = useAssistantStore((store) => store.connectionStatus);
  const toggleHistory = useAssistantStore((store) => store.toggleHistory);
  const seedPrompt = useAssistantStore((store) => store.seedPrompt);

  const lastExchange = history.slice(-2);
  const earlierCount = Math.max(0, history.length - lastExchange.length);
  const lastUser = lastExchange.find((entry) => entry.role === "user");
  const lastAssistant = lastExchange.find((entry) => entry.role === "assistant");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <AvatarOrb />

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-100">{getGreeting()}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {activeModel} is {connectionStatus === "connected" ? "ready" : connectionStatus === "checking" ? "warming up" : "unreachable"} — local inference{" "}
              {connectionStatus === "connected" ? "online" : "offline"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => seedPrompt(suggestion)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-cyan-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex w-full max-w-xl flex-col items-center gap-3 text-center">
          {lastUser ? <p className="text-sm text-slate-400">{lastUser.content}</p> : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={lastAssistant?.id ?? "pending"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 shadow-glow-soft backdrop-blur"
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
              className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-300"
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
