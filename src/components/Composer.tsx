import { forwardRef, useState } from "react";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

export const Composer = forwardRef<HTMLTextAreaElement>(function Composer(_, ref) {
  const [prompt, setPrompt] = useState("");
  const status = useAssistantStore((state) => state.state);
  const activeModel = useAssistantStore((state) => state.activeModel);
  const setActiveModel = useAssistantStore((state) => state.setActiveModel);
  const sendPrompt = useAssistantStore((state) => state.sendPrompt);

  const isBusy = status === "thinking" || status === "responding";

  async function handleSubmit() {
    const nextPrompt = prompt.trim();
    if (nextPrompt.length === 0 || isBusy) {
      return;
    }

    setPrompt("");
    await sendPrompt(nextPrompt);
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>Prompt Channel</span>
        <label className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-[11px] tracking-[0.25em] text-slate-300">
          <span>Model</span>
          <input
            value={activeModel}
            onChange={(event) => setActiveModel(event.target.value)}
            className="min-w-0 bg-transparent text-right normal-case tracking-normal text-cyan-100 outline-none"
          />
        </label>
      </div>

      <textarea
        ref={ref}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onFocus={() => useAssistantStore.getState().setState("listening")}
        onBlur={() => {
          const current = useAssistantStore.getState().state;
          if (current === "listening") {
            useAssistantStore.getState().setState("idle");
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
          }
        }}
        rows={5}
        placeholder="Type a prompt and press Enter. Shift+Enter adds a new line."
        className="w-full resize-none rounded-[22px] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/40"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Offline-first renderer. Ollama must be running at <span className="text-slate-200">http://localhost:11434</span>.
        </p>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isBusy}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
            isBusy
              ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
              : "border border-cyan-300/20 bg-cyan-300/15 text-cyan-50 hover:bg-cyan-300/20"
          )}
        >
          {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
          Send
        </button>
      </div>
    </div>
  );
});
