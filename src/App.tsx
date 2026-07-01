import { useEffect, useRef } from "react";
import { CompanionStage } from "./components/CompanionStage";
import { Composer } from "./components/Composer";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { Sidebar } from "./components/Sidebar";
import { playStartupChime } from "./services/sound";
import { useAssistantStore } from "./state/assistantStore";

function App() {
  const focusComposer = useAssistantStore((state) => state.focusComposer);
  const setAppVersion = useAssistantStore((state) => state.setAppVersion);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    focusComposer(() => {
      composerRef.current?.focus();
    });
  }, [focusComposer]);

  useEffect(() => {
    const cleanup = window.elysiaDesktop.onFocusInput(() => {
      composerRef.current?.focus();
    });

    void window.elysiaDesktop.getVersion().then(setAppVersion);
    playStartupChime();

    return cleanup;
  }, [setAppVersion]);

  return (
    <main className="flex h-screen bg-[radial-gradient(circle_at_top,_rgba(88,166,255,0.1),_transparent_35%),linear-gradient(180deg,_#091022_0%,_#050816_100%)] text-slate-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 py-5 lg:px-8">
        <CompanionStage />
        <Composer ref={composerRef} />
      </div>

      <HistoryDrawer />
    </main>
  );
}

export default App;
