import type { ProjectFileRead } from "../../types/project";

export async function readProjectFile(rootPath: string, relativePath: string): Promise<ProjectFileRead | null> {
  return window.elysiaDesktop.project.readFile(rootPath, relativePath);
}

export function flattenRead(read: ProjectFileRead, maxChars = 18_000): string {
  const content = read.chunks.map((chunk) => chunk.content).join("\n");
  return content.length > maxChars ? `${content.slice(0, maxChars)}\n\n[Truncated by Elysia]` : content;
}
