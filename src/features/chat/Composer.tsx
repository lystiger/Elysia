import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, SendHorizontal, Terminal } from "lucide-react";
import clsx from "clsx";
import { useAssistantStore } from "../../state/assistantStore";

const SLASH_COMMANDS = [
  { command: "/settings", description: "Open preferences" },
  { command: "/model", description: "Switch the active model" },
  { command: "/project", description: "Jump to a pinned project" },
  { command: "/search", description: "Search past sessions" },
  { command: "/history", description: "Open the session history" }
];

export const Composer = forwardRef<HTMLTextAreaElement>(function Composer(_, ref) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const status = useAssistantStore((state) => state.state);
  const sendPrompt = useAssistantStore((state) => state.sendPrompt);
  const promptSeed = useAssistantStore((state) => state.promptSeed);
  const clearPromptSeed = useAssistantStore((state) => state.clearPromptSeed);

  const isBusy = status === "thinking" || status === "generating";
  const matchingCommands =
    prompt.startsWith("/") && prompt.length > 0
      ? SLASH_COMMANDS.filter((entry) => entry.command.startsWith(prompt))
      : [];

  useEffect(() => {
    if (promptSeed !== null) {
      setPrompt(promptSeed);
      clearPromptSeed();
    }
  }, [promptSeed, clearPromptSeed]);

  async function handleSubmit() {
    const nextPrompt = prompt.trim();
    if (nextPrompt.length === 0 || isBusy) {
      return;
    }

    setPrompt("");
    await sendPrompt(nextPrompt);
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <AnimatePresence>
        {matchingCommands.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1020]/95 p-1.5 shadow-glow-soft backdrop-blur-xl"
          >
            {matchingCommands.map((entry) => (
              <button
                key={entry.command}
                type="button"
                onClick={() => setPrompt(entry.command + " ")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 hover:bg-white/5"
              >
                <Terminal className="size-3.5 text-cyan-300/70" />
                <span className="text-sm text-slate-200">{entry.command}</span>
                <span className="text-xs text-slate-500">{entry.description}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={clsx(
          "flex items-end gap-3 rounded-[28px] border bg-white/[0.04] p-3 backdrop-blur-xl transition-all duration-200",
          isFocused ? "border-cyan-300/30 shadow-glow" : "border-white/10 shadow-glow-soft"
        )}
      >
        <textarea
          ref={ref}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          rows={1}
          placeholder="Ask Elysia anything..."
          className="max-h-40 min-h-[2.5rem] w-full flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 placeholder:transition-opacity placeholder:duration-300 focus:placeholder:opacity-40"
        />
        <motion.button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isBusy}
          whileHover={isBusy ? undefined : { scale: 1.06 }}
          whileTap={isBusy ? undefined : { scale: 0.92 }}
          className={clsx(
            "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
            isBusy
              ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
              : "border border-cyan-300/20 bg-cyan-300/15 text-cyan-50 hover:bg-cyan-300/20"
          )}
        >
          {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
        </motion.button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-600">Shift+O to focus · Enter to send · / for commands</p>
    </div>
  );
});
