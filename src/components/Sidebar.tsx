import { Plus, Sparkles } from "lucide-react";
import { useAssistantStore } from "../state/assistantStore";
import { StatusBadge } from "./StatusBadge";

export function Sidebar() {
  const activeModel = useAssistantStore((state) => state.activeModel);
  const setActiveModel = useAssistantStore((state) => state.setActiveModel);
  const newChat = useAssistantStore((state) => state.newChat);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-4 border-r border-white/10 bg-black/20 p-4">
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
        <label className="px-1 text-xs uppercase tracking-[0.3em] text-slate-500">Model</label>
        <input
          value={activeModel}
          onChange={(event) => setActiveModel(event.target.value)}
          spellCheck={false}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-cyan-100 outline-none focus:border-cyan-300/40"
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
        <p className="px-1 text-xs text-slate-500">
          Ollama endpoint: <span className="text-slate-300">http://localhost:11434</span>
        </p>
        <div className="flex items-center justify-between px-1">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</span>
          <StatusBadge />
        </div>
      </div>
    </aside>
  );
}
