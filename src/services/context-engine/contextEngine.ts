import { projectFileLabel } from "../../domain/project/project";
import { flattenRead, readProjectFile } from "../file-reader/fileReaderService";
import { getProjectIndex } from "../project-index/projectIndexService";
import { analyzeMarkdown } from "./markdownIntelligence";
import { findRelevantFiles } from "./relevance";
import type { ProjectContextBundle, ProjectIndex } from "../../types/project";

const MAX_FILES_TO_READ = 12;
const MAX_CONTEXT_CHARS = 42_000;

export function promptNeedsProjectContext(prompt: string): boolean {
  return /(project|readme|architecture|folder|file|notes?|thesis|documentation|markdown|review|polish|improve|explain|summari[sz]e|duplicate|terminology|boolean|lecture)/i.test(
    prompt
  );
}

export async function buildProjectContextBundle(rootPath: string, prompt: string): Promise<ProjectContextBundle | null> {
  const index = await getProjectIndex(rootPath);
  if (!index) {
    return null;
  }

  const relevantFiles = findRelevantFiles(index, prompt);
  const reads = [];
  const markdownFindings = [];
  let budget = MAX_CONTEXT_CHARS;

  for (const relevant of relevantFiles.slice(0, MAX_FILES_TO_READ)) {
    if (budget <= 0) {
      break;
    }
    const read = await readProjectFile(rootPath, relevant.file.relativePath);
    if (!read) {
      continue;
    }
    const flattened = flattenRead(read, budget);
    budget -= flattened.length;
    reads.push(read);
    if (read.language === "Markdown") {
      markdownFindings.push(...analyzeMarkdown(read.relativePath, flattened));
    }
  }

  return {
    prompt,
    rootPath,
    summary: index.summary,
    relevantFiles,
    reads,
    markdownFindings
  };
}

export function formatProjectIndexForPrompt(index: ProjectIndex): string {
  const languages = index.languages.map((stat) => `${stat.language}: ${stat.files}`).join(", ") || "Unknown";
  const frameworks = index.frameworks.map((framework) => framework.name).join(", ") || "None detected";
  return [
    `Project: ${index.summary.projectName}`,
    `Root: ${index.rootPath}`,
    `Files: ${index.summary.fileCount}, folders: ${index.summary.folderCount}, readable: ${index.summary.readableFileCount}`,
    `Git repository: ${index.gitDetected ? "yes" : "no"}`,
    `Languages: ${languages}`,
    `Frameworks: ${frameworks}`,
    `Entry points: ${index.summary.entryPoints.join(", ") || "none detected"}`,
    index.summary.readmeSummary ? `README summary: ${index.summary.readmeSummary}` : null
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatContextBundleForPrompt(bundle: ProjectContextBundle): string {
  const summary = [
    "You are Elysia's Project Intelligence layer.",
    "Use only the provided project context. Do not claim to have read files that are not listed.",
    "Do not execute commands. Do not modify files directly.",
    "When improvements require edits, propose a clear unified diff and wait for user approval.",
    "",
    `Project: ${bundle.summary.projectName}`,
    `Root: ${bundle.rootPath}`,
    `Stack: ${bundle.summary.technologyStack.join(", ") || "unknown"}`,
    `Git detected: ${bundle.summary.gitDetected ? "yes" : "no"}`,
    bundle.summary.readmeSummary ? `README summary: ${bundle.summary.readmeSummary}` : null,
    "",
    "Relevant files selected:",
    ...bundle.relevantFiles.map((item) => `- ${projectFileLabel(item.file)} — ${item.reasons.join(", ")}`)
  ]
    .filter(Boolean)
    .join("\n");

  const findings =
    bundle.markdownFindings.length > 0
      ? [
          "Markdown findings:",
          ...bundle.markdownFindings.map(
            (finding) => `- ${finding.relativePath}:${finding.line} [${finding.severity}] ${finding.message}`
          )
        ].join("\n")
      : "Markdown findings: none detected in selected files.";

  const fileBlocks = bundle.reads
    .map((read) => {
      const content = flattenRead(read);
      return [
        `--- FILE: ${read.relativePath} (${read.language}, ${read.truncated ? "truncated" : "complete"}) ---`,
        content,
        `--- END FILE: ${read.relativePath} ---`
      ].join("\n");
    })
    .join("\n\n");

  return [summary, findings, "Selected file contents:", fileBlocks].join("\n\n");
}
