import { useEffect } from "react";
import { Play, Pause, Square, Timer } from "lucide-react";
import clsx from "clsx";
import { useProductivityStore } from "../state/productivityStore";
import { useAssistantStore } from "../state/assistantStore";

export function FocusPanel() {
  const { activeSession, startSession, pauseSession, resumeSession, endSession, tickSession } = useProductivityStore();
  const setAssistantState = useAssistantStore((s) => s.setState);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession?.status === "active") {
      interval = setInterval(() => {
        tickSession();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.status, tickSession]);

  useEffect(() => {
    if (activeSession?.status === "active") {
      setAssistantState("focused");
    } else if (activeSession?.status === "paused") {
      setAssistantState("paused");
    } else if (activeSession?.status === "completed") {
      setAssistantState("idle");
    }
  }, [activeSession?.status, setAssistantState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!activeSession) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Timer className="size-5 text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Focus Session</h3>
        </div>
        <button
          onClick={() => startSession("Deep Work", "Coding Elysia", 25)}
          className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-3 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
        >
          Start 25m Session
        </button>
      </div>
    );
  }

  const remainingSeconds = activeSession.durationMinutes * 60 - activeSession.elapsedSeconds;

  return (
    <div className={clsx(
      "rounded-[24px] border p-4 transition-all duration-500",
      activeSession.status === "active" ? "border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/5" : "border-white/10 bg-black/20"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={clsx(
            "size-2 rounded-full animate-pulse",
            activeSession.status === "active" ? "bg-indigo-400" : "bg-slate-500"
          )} />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {activeSession.status}
          </span>
        </div>
        <span className="font-mono text-2xl font-bold text-indigo-100">
          {formatTime(remainingSeconds)}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-200">{activeSession.title}</h4>
        <p className="text-xs text-slate-400 mt-1">{activeSession.objective}</p>
      </div>

      <div className="flex gap-2">
        {activeSession.status === "active" ? (
          <button
            onClick={pauseSession}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
          >
            <Pause className="size-3" /> Pause
          </button>
        ) : (
          <button
            onClick={resumeSession}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-500/20 py-2 text-xs font-medium text-indigo-100 hover:bg-indigo-500/30"
          >
            <Play className="size-3" /> Resume
          </button>
        )}
        <button
          onClick={endSession}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
        >
          <Square className="size-3" />
        </button>
      </div>
    </div>
  );
}
