import { useEffect, useState } from "react";
import { Brain, Eye, Gauge, Mic, Pin, Plus, Sparkles, Wrench } from "lucide-react";
import clsx from "clsx";
import { pinnedProjects, recentSessions } from "../data/companion";
import { useAssistantStore } from "../state/assistantStore";
import { ModelSelect } from "./ModelSelect";

function formatModelName(model: string): string {
  const [name = model, tag] = model.split(":");
  const spaced = name.replace(/([a-zA-Z])(\d)/g, "$1 $2");
  const titled = spaced.replace(/\b\w/g, (char) => char.toUpperCase());
  return tag ? `${titled} ${tag.toUpperCase()}` : titled;
}

const comingSoonRows = [
  { label: "Memory", icon: Brain },
  { label: "Voice", icon: Mic },
  { label: "Vision", icon: Eye },
  { label: "Tools", icon: Wrench }
];

export function Sidebar() {
  const newChat = useAssistantStore((state) => state.newChat);
  const activeModel = useAssistantStore((state) => state.activeModel);
  const connectionStatus = useAssistantStore((state) => state.connectionStatus);
  const checkConnection = useAssistantStore((state) => state.checkConnection);
  const latencyMs = useAssistantStore((state) => state.latencyMs);
  const tokensPerSecond = useAssistantStore((state) => state.tokensPerSecond);
  const [memoryPercent, setMemoryPercent] = useState<number | null>(null);

  useEffect(() => {
    void checkConnection();
    const interval = setInterval(() => void checkConnection(), 20000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  useEffect(() => {
    function pollMemory() {
      void window.elysiaDesktop.getSystemMemory().then((info) => {
        setMemoryPercent(Math.round(((info.total - info.free) / info.total) * 100));
      });
    }

    pollMemory();
    const interval = setInterval(pollMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-6 border-r border-white/10 bg-black/20 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="size-5 text-accent-cyan" />
        <span className="font-display text-lg font-semibold tracking-tight">Elysia</span>
      </div>

      <button
        type="button"
        onClick={newChat}
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-glow-soft active:translate-y-0"
      >
        <Plus className="size-4" />
        New chat
      </button>

      <div className="flex flex-col gap-2">
        <p className="px-1 text-xs uppercase tracking-[0.3em] text-slate-500">Recent sessions</p>
        <ul className="flex flex-col gap-1">
          {recentSessions.map((session) => (
            <li key={session.title}>
              <button
                type="button"
                className={clsx(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200 hover:translate-x-0.5 hover:bg-white/5",
                  session.active && "bg-white/5"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={clsx(
                      "size-1.5 shrink-0 rounded-full",
                      session.active ? "bg-cyan-300" : "bg-slate-600"
                    )}
                  />
                  <span className="truncate text-sm text-slate-200">{session.title}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">{session.relativeTime}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 px-1 text-xs uppercase tracking-[0.3em] text-slate-500">
          <Pin className="size-3.5" />
          Pinned projects
        </p>
        <ul className="flex flex-col gap-1">
          {pinnedProjects.map((project) => (
            <li key={project.name}>
              <button
                type="button"
                className={clsx(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 hover:translate-x-0.5 hover:bg-white/5 hover:text-slate-100",
                  project.name === "Elysia" ? "bg-white/5 text-slate-100" : "text-slate-400"
                )}
              >
                <project.icon className="size-3.5 shrink-0" />
                <span className="truncate">{project.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
        <p className="px-1 text-xs uppercase tracking-[0.3em] text-slate-500">Local AI</p>

        <div className="flex flex-col gap-2">
          <label className="px-1 text-xs text-slate-500">Model</label>
          <ModelSelect />
        </div>

        <div className="grid grid-cols-3 gap-2 px-1">
          <div className="flex flex-col gap-0.5 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Latency</span>
            <span className="text-xs text-slate-300">{latencyMs !== null ? `${latencyMs}ms` : "—"}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Memory</span>
            <span className="text-xs text-slate-300">{memoryPercent !== null ? `${memoryPercent}%` : "—"}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Speed</span>
            <span className="text-xs text-slate-300">
              {tokensPerSecond !== null ? `${tokensPerSecond.toFixed(0)} t/s` : "—"}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 text-sm text-slate-500">
          {comingSoonRows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between rounded-xl px-3 py-2 opacity-60"
            >
              <span className="flex items-center gap-2">
                <row.icon className="size-4" />
                {row.label}
              </span>
              <span className="text-xs text-slate-600">Coming soon</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between px-1 pt-1">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-slate-500">
            <Gauge className="size-3.5" />
            {formatModelName(activeModel)}
          </span>
          <span
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-200",
              connectionStatus === "connected"
                ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                : connectionStatus === "checking"
                  ? "border-white/10 bg-white/5 text-slate-400"
                  : "border-red-300/30 bg-red-300/10 text-red-100"
            )}
          >
            <span
              className={clsx(
                "size-1.5 rounded-full",
                connectionStatus === "connected"
                  ? "bg-cyan-300"
                  : connectionStatus === "checking"
                    ? "bg-slate-500"
                    : "bg-red-300"
              )}
            />
            {connectionStatus === "connected" ? "Connected" : connectionStatus === "checking" ? "Checking" : "Offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
