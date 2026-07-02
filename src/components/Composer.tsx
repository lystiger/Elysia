import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Cpu, LoaderCircle, SendHorizontal } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../state/assistantStore";
import { useEffectiveModel, useSpaceStore } from "../state/spaceStore";

export const Composer = forwardRef<HTMLTextAreaElement>(function Composer(_, forwardedRef) {
  const [prompt, setPrompt] = useState("");
  const [modelDraft, setModelDraft] = useState("");
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const status = useAssistantStore((state) => state.state);
  const sendPrompt = useAssistantStore((state) => state.sendPrompt);
  const setTyping = useAssistantStore((state) => state.setTyping);
  const promptSeed = useAssistantStore((state) => state.promptSeed);
  const clearPromptSeed = useAssistantStore((state) => state.clearPromptSeed);

  // Model follows the active conversation / Space, and editing it here updates
  // the Space's remembered preference.
  const model = useEffectiveModel();
  const activeSpaceId = useSpaceStore((state) => state.activeSpaceId);
  const setSpaceModel = useSpaceStore((state) => state.setSpaceModel);

  const isBusy = status === "thinking" || status === "responding" || status === "generating";
  const isListening = status === "listening";
  const canSend = prompt.trim().length > 0 && !isBusy;

  const assignRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  // Grow the command bar with its content, then snap back when cleared.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [prompt]);

  // Suggestion chips seed the composer through the assistant store; pick it up
  // here, drop it into the input, and clear the seed.
  useEffect(() => {
    if (promptSeed !== null) {
      setPrompt(promptSeed);
      setTyping(promptSeed.length > 0);
      clearPromptSeed();
      innerRef.current?.focus();
    }
  }, [promptSeed, clearPromptSeed, setTyping]);

  useEffect(() => {
    setModelDraft(model);
  }, [model]);

  async function handleSubmit() {
    const nextPrompt = prompt.trim();
    if (nextPrompt.length === 0 || isBusy) {
      return;
    }

    setPrompt("");
    setTyping(false);
    await sendPrompt(nextPrompt);
  }

  async function commitModelDraft() {
    await setSpaceModel(activeSpaceId, modelDraft);
    setModelDraft(useSpaceStore.getState().effectiveModel());
  }

  return (
    <div className="pointer-events-auto w-full max-w-3xl">
      <div
        className={clsx(
          "flex items-end gap-3 rounded-[26px] border bg-[#0a0f1f]/80 px-4 py-3 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors",
          status === "error" || status === "offline"
            ? "border-rose-400/40"
            : isListening
              ? "border-cyan-300/40 shadow-[0_0_45px_-8px_rgba(100,241,255,0.45)]"
              : "border-white/10"
        )}
      >
        <textarea
          ref={assignRef}
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            setTyping(event.target.value.length > 0);
          }}
          onFocus={() => {
            useAssistantStore.getState().setState("listening");
            setTyping(prompt.length > 0);
          }}
          onBlur={() => {
            const current = useAssistantStore.getState().state;
            if (current === "listening") {
              useAssistantStore.getState().setState("idle");
            }
            setTyping(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          rows={1}
          placeholder="Talk to Elysia…  (Shift+O to focus, Enter to send)"
          className="scrollbar-thin max-h-40 min-h-[1.5rem] w-full resize-none bg-transparent py-1.5 text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSend}
          aria-label="Send message"
          className={clsx(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border transition",
            canSend
              ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-50 hover:bg-cyan-300/25"
              : "cursor-not-allowed border-white/10 bg-white/5 text-slate-600"
          )}
        >
          {isBusy ? <LoaderCircle className="size-5 animate-spin" /> : <SendHorizontal className="size-5" />}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 px-2 text-[11px] text-slate-500">
        <Cpu className="size-3" />
        <input
          value={modelDraft}
          onChange={(event) => setModelDraft(event.target.value)}
          onBlur={() => void commitModelDraft()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          aria-label="Active model"
          spellCheck={false}
          className="w-44 bg-transparent text-center text-cyan-200/80 outline-none placeholder:text-slate-600"
        />
      </div>
    </div>
  );
});
