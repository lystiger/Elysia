import type { ProjectFileEntry, ProjectFileKind, ProjectLanguage } from "../../types/project";

export const IGNORED_PROJECT_DIRECTORIES = [
  ".git",
  "node_modules",
  "build",
  "dist",
  "coverage",
  "target",
  ".venv",
  "__pycache__"
] as const;

export const READABLE_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".py",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".java",
  ".c",
  ".h",
  ".cpp",
  ".cc",
  ".cxx",
  ".hpp",
  ".rs",
  ".go",
  ".html",
  ".css"
]);

export function languageForExtension(extension: string): ProjectLanguage {
  switch (extension.toLowerCase()) {
    case ".ts":
    case ".tsx":
      return "TypeScript";
    case ".js":
    case ".jsx":
      return "JavaScript";
    case ".py":
      return "Python";
    case ".rs":
      return "Rust";
    case ".c":
    case ".h":
      return "C";
    case ".cpp":
    case ".cc":
    case ".cxx":
    case ".hpp":
      return "C++";
    case ".java":
      return "Java";
    case ".go":
      return "Go";
    case ".md":
    case ".markdown":
      return "Markdown";
    case ".json":
      return "JSON";
    case ".yaml":
    case ".yml":
      return "YAML";
    case ".html":
      return "HTML";
    case ".css":
      return "CSS";
    case ".txt":
      return "Text";
    default:
      return "Other";
  }
}

export function kindForPath(relativePath: string, extension: string): ProjectFileKind {
  const lower = relativePath.toLowerCase();
  if (extension === ".md" || extension === ".markdown" || lower.includes("readme")) {
    return "documentation";
  }
  if (
    lower.endsWith("package.json") ||
    lower.endsWith("tsconfig.json") ||
    lower.endsWith("vite.config.ts") ||
    lower.endsWith("tailwind.config.ts") ||
    lower.endsWith("dockerfile") ||
    extension === ".json" ||
    extension === ".yaml" ||
    extension === ".yml"
  ) {
    return "config";
  }
  if (READABLE_EXTENSIONS.has(extension)) {
    return "source";
  }
  if (/\.(png|jpg|jpeg|gif|webp|svg|pdf|zip|mp4|mp3)$/i.test(lower)) {
    return "asset";
  }
  return "unknown";
}

export function projectFileLabel(file: ProjectFileEntry): string {
  const sizeKb = Math.max(1, Math.round(file.sizeBytes / 1024));
  return `${file.relativePath} (${file.language}, ${sizeKb} KB)`;
}
