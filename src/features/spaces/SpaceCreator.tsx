import { useEffect, useState } from "react";
import { FolderPlus, LoaderCircle, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import { useSpaceStore } from "../../state/spaceStore";
import { useSpaceActions } from "./SpaceContext";

export function SpaceCreator() {
  const open = useSpaceStore((state) => state.spaceCreatorOpen);
  const setOpen = useSpaceStore((state) => state.setSpaceCreatorOpen);
  const { addFolderAsSpace, createManualSpace } = useSpaceActions();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🗂️");
  const [preferredModel, setPreferredModel] = useState("");
  const [busy, setBusy] = useState<"folder" | "manual" | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, setOpen]);

  const resetAndClose = () => {
    setName("");
    setDescription("");
    setIcon("🗂️");
    setPreferredModel("");
    setOpen(false);
  };

  const handleFolder = async () => {
    setBusy("folder");
    try {
      const space = await addFolderAsSpace();
      if (space) {
        toast.success(`${space.name} added as a Space`);
        resetAndClose();
      }
    } catch {
      toast.error("Unable to add that folder");
    } finally {
      setBusy(null);
    }
  };

  const handleManual = async () => {
    if (!name.trim()) {
      return;
    }
    setBusy("manual");
    try {
      await createManualSpace({
        name,
        description,
        icon: icon.trim() ? { kind: "emoji", value: icon.trim() } : undefined,
        preferredModel: preferredModel.trim() || null
      });
      toast.success(`${name.trim()} created`);
      resetAndClose();
    } catch {
      toast.error("Unable to create this Space");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div
        onClick={() => !busy && setOpen(false)}
        aria-hidden={!open}
        className={clsx(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Create a Space"
        aria-hidden={!open}
        className={clsx(
          "fixed left-1/2 top-1/2 z-[60] w-[min(92vw,32rem)] -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0a1020]/95 p-5 shadow-2xl backdrop-blur-xl transition duration-200",
          open
            ? "-translate-y-1/2 scale-100 opacity-100"
            : "pointer-events-none -translate-y-[45%] scale-95 opacity-0"
        )}
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Create a Space</h2>
            <p className="mt-1 text-sm text-slate-400">Bind a folder, or make a context without one.</p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={Boolean(busy)}
            aria-label="Close Space creator"
            className="rounded-full border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </header>

        <button
          type="button"
          onClick={() => void handleFolder()}
          disabled={Boolean(busy)}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-4 text-left transition hover:bg-cyan-300/[0.13] disabled:opacity-60"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
            {busy === "folder" ? <LoaderCircle className="size-5 animate-spin" /> : <FolderPlus className="size-5" />}
          </span>
          <span>
            <span className="block text-sm font-medium text-cyan-50">Add Folder as Space</span>
            <span className="block text-xs text-slate-400">Choose a local folder with the native picker</span>
          </span>
        </button>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
          <span className="h-px flex-1 bg-white/10" /> or create manually <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-[4.5rem_1fr] gap-3">
          <label className="text-xs text-slate-400">
            Icon
            <input
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              maxLength={8}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-lg outline-none focus:border-cyan-300/30"
            />
          </label>
          <label className="text-xs text-slate-400">
            Name <span className="text-rose-300">*</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Space"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/30"
            />
          </label>
        </div>
        <label className="mt-3 block text-xs text-slate-400">
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional context for this Space"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/30"
          />
        </label>
        <label className="mt-3 block text-xs text-slate-400">
          Preferred model
          <input
            value={preferredModel}
            onChange={(event) => setPreferredModel(event.target.value)}
            placeholder="Keep current model"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/30"
          />
        </label>

        <button
          type="button"
          onClick={() => void handleManual()}
          disabled={!name.trim() || Boolean(busy)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "manual" ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Create manual Space
        </button>
      </section>
    </>
  );
}
