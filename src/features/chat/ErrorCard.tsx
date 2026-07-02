import { AlertTriangle, CircleSlash, PackageX, RotateCcw, WifiOff } from "lucide-react";
import clsx from "clsx";
import type { MessageErrorKind } from "../../domain/message/message";

const ERROR_COPY: Record<MessageErrorKind, { icon: typeof AlertTriangle; title: string; tone: "muted" | "alert" }> = {
  offline: { icon: WifiOff, title: "Can't reach Ollama", tone: "alert" },
  aborted: { icon: CircleSlash, title: "Stopped", tone: "muted" },
  "unknown-model": { icon: PackageX, title: "Model not found", tone: "alert" },
  "invalid-response": { icon: AlertTriangle, title: "Invalid response", tone: "alert" },
  unknown: { icon: AlertTriangle, title: "Something went wrong", tone: "alert" }
};

export function ErrorCard({
  kind,
  message,
  onRetry
}: {
  kind: MessageErrorKind;
  message: string;
  onRetry?: () => void;
}) {
  const { icon: Icon, title, tone } = ERROR_COPY[kind] ?? ERROR_COPY.unknown;

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left",
        tone === "alert" ? "border-red-300/25 bg-red-300/[0.06]" : "border-white/10 bg-white/[0.03]"
      )}
    >
      <Icon className={clsx("mt-0.5 size-4 shrink-0", tone === "alert" ? "text-red-300" : "text-slate-400")} />
      <div className="min-w-0 flex-1">
        <p className={clsx("text-sm font-medium", tone === "alert" ? "text-red-100" : "text-slate-300")}>{title}</p>
        <p className="mt-0.5 text-sm text-slate-400">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 flex items-center gap-1.5 text-xs text-cyan-200 transition-colors duration-150 hover:text-cyan-100"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
