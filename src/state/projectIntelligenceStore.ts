import { create } from "zustand";
import { extractDiffProposals } from "../services/diff-engine/diffEngine";
import { invalidateProjectIndex } from "../services/project-index/projectIndexService";
import type { DiffProposal, ProjectIndex } from "../types/project";

type ProjectIntelligenceState = {
  index: ProjectIndex | null;
  indexing: boolean;
  proposals: DiffProposal[];
  setIndexing: (indexing: boolean) => void;
  setIndex: (index: ProjectIndex | null) => void;
  captureProposals: (response: string) => void;
  clearProposals: () => void;
  reject: (id: string) => void;
  rejectAll: () => void;
  accept: (id: string, rootPath: string) => Promise<void>;
  acceptAll: (rootPath: string) => Promise<void>;
  undo: (id: string, rootPath: string) => Promise<void>;
  clear: () => void;
};

export const useProjectIntelligenceStore = create<ProjectIntelligenceState>((set, get) => ({
  index: null,
  indexing: false,
  proposals: [],
  setIndexing: (indexing) => set({ indexing }),
  setIndex: (index) => set({ index, indexing: false }),
  captureProposals: (response) => {
    const proposals = extractDiffProposals(response);
    if (proposals.length > 0) {
      set({ proposals });
    }
  },
  clearProposals: () => set({ proposals: [] }),
  reject: (id) =>
    set((state) => ({
      proposals: state.proposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: "rejected" } : proposal
      )
    })),
  rejectAll: () =>
    set((state) => ({
      proposals: state.proposals.map((proposal) =>
        proposal.status === "pending" ? { ...proposal, status: "rejected" } : proposal
      )
    })),
  accept: async (id, rootPath) => {
    const proposal = get().proposals.find((item) => item.id === id);
    if (!proposal || proposal.status !== "pending") {
      return;
    }
    set((state) => ({
      proposals: state.proposals.map((item) =>
        item.id === id ? { ...item, status: "accepted" } : item
      )
    }));
    const result = await window.elysiaDesktop.project.applyWrite({
      rootPath,
      relativePath: proposal.relativePath,
      expectedBefore: proposal.before,
      after: proposal.after
    });
    if (!result.ok) {
      set((state) => ({
        proposals: state.proposals.map((item) =>
          item.id === id ? { ...item, status: "pending", summary: `${item.summary} Apply failed: ${result.reason}` } : item
        )
      }));
      return;
    }
    invalidateProjectIndex(rootPath);
    set((state) => ({
      proposals: state.proposals.map((item) =>
        item.id === id ? { ...item, status: "applied", undoToken: result.undoToken } : item
      )
    }));
  },
  acceptAll: async (rootPath) => {
    const pending = get().proposals.filter((proposal) => proposal.status === "pending");
    for (const proposal of pending) {
      await get().accept(proposal.id, rootPath);
    }
  },
  undo: async (id, rootPath) => {
    const proposal = get().proposals.find((item) => item.id === id);
    if (!proposal?.undoToken || proposal.status !== "applied") {
      return;
    }
    const result = await window.elysiaDesktop.project.undoWrite({
      rootPath,
      undoToken: proposal.undoToken
    });
    if (!result.ok) {
      set((state) => ({
        proposals: state.proposals.map((item) =>
          item.id === id ? { ...item, summary: `${item.summary} Undo failed: ${result.reason}` } : item
        )
      }));
      return;
    }
    invalidateProjectIndex(rootPath);
    set((state) => ({
      proposals: state.proposals.map((item) =>
        item.id === id ? { ...item, status: "undone", undoToken: undefined } : item
      )
    }));
  },
  clear: () => set({ index: null, indexing: false, proposals: [] })
}));
