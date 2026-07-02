import type { ProjectIndex, ProjectIndexOptions } from "../../types/project";

const cache = new Map<string, ProjectIndex>();

export async function indexProject(rootPath: string, options?: ProjectIndexOptions): Promise<ProjectIndex | null> {
  const index = await window.elysiaDesktop.project.index(rootPath, options);
  if (index) {
    cache.set(rootPath, index);
  }
  return index;
}

export async function getProjectIndex(rootPath: string): Promise<ProjectIndex | null> {
  const existing = cache.get(rootPath);
  if (existing && Date.now() - existing.generatedAt < 30_000) {
    return existing;
  }
  return indexProject(rootPath);
}

export function invalidateProjectIndex(rootPath: string): void {
  cache.delete(rootPath);
}
