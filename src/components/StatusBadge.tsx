import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

export function StatusBadge() {
  const state = useAssistantStore((store) => store.state);
  const version = useAssistantStore((store) => store.appVersion);

  return (
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
  );
}
