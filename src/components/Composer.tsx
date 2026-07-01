import { forwardRef, useState } from "react";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";

export const Composer = forwardRef<HTMLTextAreaElement>(function Composer(_, ref) {
  const [prompt, setPrompt] = useState("");
  const status = useAssistantStore((state) => state.state);
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
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-end gap-3 rounded-3xl border border-white/10 bg-black/30 p-3 shadow-glow backdrop-blur">
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
          rows={1}
          placeholder="Message Elysia... (Shift+Enter for a new line)"
          className="max-h-40 min-h-[2.5rem] w-full flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isBusy}
          className={clsx(
            "flex size-10 shrink-0 items-center justify-center rounded-full transition",
            isBusy
              ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
              : "border border-cyan-300/20 bg-cyan-300/15 text-cyan-50 hover:bg-cyan-300/20"
          )}
        >
          {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Press <span className="text-slate-300">T</span> to focus input. Ollama must be running locally.
      </p>
    </div>
  );
});
