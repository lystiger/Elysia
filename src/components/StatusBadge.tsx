import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

export function StatusBadge() {
  const state = useAssistantStore((store) => store.state);
  const version = useAssistantStore((store) => store.appVersion);
  const observedApp = useAssistantStore((store) => store.observedApp);

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400">
        Observing: <span className="text-cyan-300">{observedApp}</span>
      </div>
      <div
        className={clsx(
          "rounded-full border px-3 py-2 text-xs uppercase tracking-[0.3em]",
          state === "error"
            ? "border-red-300/40 bg-red-300/10 text-red-100"
            : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
        )}
      >
        {state} {version ? `v${version}` : ""}
      </div>
    </div>
  );
}
