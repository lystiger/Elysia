import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { FocusPanel } from "./FocusPanel";
import { GoalPanel } from "./GoalPanel";

type ObjectivesDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function ObjectivesDrawer({ open, onClose }: ObjectivesDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={clsx(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        aria-hidden={!open}
        className={clsx(
          "fixed left-0 top-0 z-40 flex h-full w-full max-w-sm flex-col gap-4 border-r border-white/10 bg-[#070b18]/95 p-5 backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-[105%]"
        )}
      >
        <header className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-100">Focus &amp; Objectives</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </header>

        <FocusPanel />
        <div className="min-h-0 flex-1">
          <GoalPanel />
        </div>
      </aside>
    </>
  );
}
