import { useEffect, useState } from "react";
import { Brain, Eye, Gauge, Mic, Wrench } from "lucide-react";
import clsx from "clsx";
import { ModelSelect } from "../models/ModelSelect";
import { useAssistantStore } from "../../state/assistantStore";

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

export function SystemPanel() {
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
    <div className="flex flex-col gap-3">
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
          <li key={row.label} className="flex items-center justify-between rounded-xl px-3 py-2 opacity-60">
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
  );
}
