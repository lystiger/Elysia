import { useEffect } from "react";
import { Brain, Mic, Pin, Plus, Sparkles, Wrench } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";
import { ModelSelect } from "./ModelSelect";

const pinnedProjects = ["Computer Architecture", "AOI", "SignGlove", "Elysia"];

export function Sidebar() {
  const newChat = useAssistantStore((state) => state.newChat);
  const connectionStatus = useAssistantStore((state) => state.connectionStatus);
  const checkConnection = useAssistantStore((state) => state.checkConnection);

  useEffect(() => {
    void checkConnection();
    const interval = setInterval(() => void checkConnection(), 20000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-6 border-r border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="size-5 text-accent-cyan" />
        <span className="font-display text-lg font-semibold">Elysia</span>
      </div>

      <button
        type="button"
        onClick={newChat}
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
      >
        <Plus className="size-4" />
        New chat
      </button>

      <div className="flex flex-col gap-2">
        <p className="px-1 text-xs uppercase tracking-[0.3em] text-slate-500">Recent sessions</p>
        <p className="rounded-2xl border border-dashed border-white/10 px-3 py-3 text-xs text-slate-500">
          No recent sessions yet.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 px-1 text-xs uppercase tracking-[0.3em] text-slate-500">
          <Pin className="size-3.5" />
          Pinned projects
        </p>
        <ul className="flex flex-col gap-1">
          {pinnedProjects.map((project) => (
            <li
              key={project}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm",
                project === "Elysia" ? "bg-white/5 text-slate-100" : "text-slate-400"
              )}
            >
              {project}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
        <p className="px-1 text-xs uppercase tracking-[0.3em] text-slate-500">System</p>

        <div className="flex flex-col gap-2">
          <label className="px-1 text-xs text-slate-500">Model</label>
          <ModelSelect />
        </div>

        <ul className="flex flex-col gap-1 text-sm text-slate-500">
          <li className="flex items-center justify-between rounded-xl px-3 py-2">
            <span className="flex items-center gap-2">
              <Brain className="size-4" />
              Memory
            </span>
            <span className="text-xs text-slate-600">Coming soon</span>
          </li>
          <li className="flex items-center justify-between rounded-xl px-3 py-2">
            <span className="flex items-center gap-2">
              <Mic className="size-4" />
              Voice
            </span>
            <span className="text-xs text-slate-600">Coming soon</span>
          </li>
          <li className="flex items-center justify-between rounded-xl px-3 py-2">
            <span className="flex items-center gap-2">
              <Wrench className="size-4" />
              Tools
            </span>
            <span className="text-xs text-slate-600">Coming soon</span>
          </li>
        </ul>

        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</span>
          <span
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
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
