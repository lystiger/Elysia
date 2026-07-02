import { useEffect, useRef, useState } from "react";
import { MessageSquareText, Sparkles, Target } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { AvatarStage } from "../components/AvatarStage";
import { Composer } from "../components/Composer";
import { CurrentDialogue } from "../components/CurrentDialogue";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { ObjectivesDrawer } from "../components/ObjectivesDrawer";
import { StatusBadge } from "../components/StatusBadge";
import { playStartupChime } from "../services/system/sound";
import { useAssistantStore } from "../state/assistantStore";

function App() {
  const focusComposer = useAssistantStore((state) => state.focusComposer);
  const setAppVersion = useAssistantStore((state) => state.setAppVersion);
  const setObservedApp = useAssistantStore((state) => state.setObservedApp);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);

  useEffect(() => {
    focusComposer(() => {
      composerRef.current?.focus();
    });
  }, [focusComposer]);

  useEffect(() => {
    const cleanupFocus = window.elysiaDesktop.onFocusInput(() => {
      composerRef.current?.focus();
    });
    const cleanupAwareness = window.elysiaDesktop.onWindowChanged(setObservedApp);

    void window.elysiaDesktop.getVersion().then(setAppVersion);
    playStartupChime();

    return () => {
      cleanupFocus();
      cleanupAwareness();
    };
  }, [setAppVersion, setObservedApp]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(88,166,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,127,224,0.08),_transparent_40%),linear-gradient(180deg,_#070b18_0%,_#04060f_100%)] text-slate-100">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            fontSize: "14px",
            maxWidth: "400px"
          }
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_55%,_rgba(0,0,0,0.55))]"
      />
      <div className="absolute inset-0">
        <AvatarStage />
      </div>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <Sparkles className="size-5 text-accent-cyan" />
          <span className="font-display text-lg font-semibold tracking-wide">Elysia</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <StatusBadge />
          <button
            type="button"
            onClick={() => setObjectivesOpen(true)}
            aria-label="Focus and objectives"
            className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Target className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="Conversation history"
            className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <MessageSquareText className="size-4" />
          </button>
        </div>
      </header>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-4 pb-8">
        <CurrentDialogue />
        <Composer ref={composerRef} />
      </div>
      <ObjectivesDrawer open={objectivesOpen} onClose={() => setObjectivesOpen(false)} />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </main>
  );
}

export default App;
