import { Check, CheckCheck, FileDiff, Undo2, X, XCircle } from "lucide-react";
import clsx from "clsx";
import { useSpaceStore } from "../../state/spaceStore";
import { useProjectIntelligenceStore } from "../../state/projectIntelligenceStore";

export function DiffReviewPanel() {
  const proposals = useProjectIntelligenceStore((state) => state.proposals);
  const accept = useProjectIntelligenceStore((state) => state.accept);
  const acceptAll = useProjectIntelligenceStore((state) => state.acceptAll);
  const reject = useProjectIntelligenceStore((state) => state.reject);
  const rejectAll = useProjectIntelligenceStore((state) => state.rejectAll);
  const undo = useProjectIntelligenceStore((state) => state.undo);
  const activeSpace = useSpaceStore((state) => state.spaces.find((space) => space.id === state.activeSpaceId));
  const rootPath = activeSpace?.folderPath ?? null;
  const pending = proposals.filter((proposal) => proposal.status === "pending");

  if (proposals.length === 0 || !rootPath) {
    return null;
  }

  return (
    <section className="mt-4 space-y-3 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/80">
          <FileDiff className="size-3.5" />
          Proposed changes
        </p>
        {pending.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void acceptAll(rootPath)}
              className="flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100 hover:bg-emerald-300/15"
            >
              <CheckCheck className="size-3" />
              Accept all
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              <XCircle className="size-3" />
              Reject all
            </button>
          </div>
        ) : null}
      </div>

      {proposals.map((proposal) => (
        <article key={proposal.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <div className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{proposal.relativePath}</p>
              <p className="mt-0.5 text-xs text-slate-400">{proposal.summary}</p>
            </div>
            <span
              className={clsx(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
                proposal.status === "applied"
                  ? "bg-emerald-300/10 text-emerald-200"
                  : proposal.status === "undone"
                    ? "bg-cyan-300/10 text-cyan-200"
                  : proposal.status === "rejected"
                    ? "bg-white/5 text-slate-500"
                    : "bg-amber-300/10 text-amber-200"
              )}
            >
              {proposal.status}
            </span>
          </div>
          <pre className="scrollbar-thin max-h-56 overflow-auto border-y border-white/10 bg-[#050813] px-4 py-3 text-left text-xs leading-5 text-slate-300">
            {proposal.unifiedDiff}
          </pre>
          {proposal.status === "pending" ? (
            <div className="flex justify-end gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => reject(proposal.id)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
              >
                <X className="size-3.5" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => void accept(proposal.id, rootPath)}
                className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-300/15"
              >
                <Check className="size-3.5" />
                Accept
              </button>
            </div>
          ) : proposal.status === "applied" && proposal.undoToken ? (
            <div className="flex justify-end px-4 py-3">
              <button
                type="button"
                onClick={() => void undo(proposal.id, rootPath)}
                className="flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-300/15"
              >
                <Undo2 className="size-3.5" />
                Undo
              </button>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
