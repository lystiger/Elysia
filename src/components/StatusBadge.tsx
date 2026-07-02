import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

const dotColor: Record<string, string> = {
  idle: "bg-cyan-300",
  listening: "bg-sky-400",
  thinking: "bg-fuchsia-400",
  responding: "bg-cyan-200",
  focused: "bg-indigo-400",
  paused: "bg-slate-400",
  error: "bg-rose-400"
};

export function StatusBadge() {
  const state = useAssistantStore((store) => store.state);
  const version = useAssistantStore((store) => store.appVersion);
  const observedApp = useAssistantStore((store) => store.observedApp);

  const showObservedApp = observedApp && observedApp !== "Desktop" && observedApp !== "Unknown";

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs backdrop-blur">
      <span
        className={clsx(
          "size-2 rounded-full",
          dotColor[state] ?? "bg-cyan-300",
          state !== "idle" && "animate-pulse"
        )}
      />
      <span className="capitalize text-slate-200">{state}</span>
      {showObservedApp ? (
        <span className="max-w-[10rem] truncate text-slate-500">· {observedApp}</span>
      ) : null}
      {version ? <span className="text-slate-600">v{version}</span> : null}
    </div>
  );
}
