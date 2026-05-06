import { useEffect, useRef } from "react";
import { Orbit, Sparkles } from "lucide-react";
import { AvatarStage } from "./components/AvatarStage";
import { Composer } from "./components/Composer";
import { ResponsePanel } from "./components/ResponsePanel";
import { StatusBadge } from "./components/StatusBadge";
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

    return cleanup;
  }, [setAppVersion]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(88,166,255,0.18),_transparent_30%),linear-gradient(180deg,_#091022_0%,_#050816_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 shadow-glow backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Local Companion Shell</p>
            <div className="mt-2 flex items-center gap-3">
              <Sparkles className="size-7 text-accent-cyan" />
              <h1 className="font-display text-3xl font-semibold">Elysia</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge />
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">
              Press <span className="font-semibold text-white">T</span> to focus input
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Avatar Stage</p>
                <p className="mt-1 text-sm text-slate-300">Reactive shell for idle, listening, thinking, and responding states.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 p-3 text-cyan-200">
                <Orbit className="size-5" />
              </div>
            </div>
            <AvatarStage />
          </div>

          <div className="flex min-h-[38rem] flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-4 backdrop-blur">
            <ResponsePanel />
            <Composer ref={composerRef} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
