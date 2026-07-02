export type ProjectLanguage =
  | "TypeScript"
  | "JavaScript"
  | "Python"
  | "Rust"
  | "C"
  | "C++"
  | "Java"
  | "Go"
  | "Markdown"
  | "JSON"
  | "YAML"
  | "HTML"
  | "CSS"
  | "Text"
  | "Other";

export type ProjectFileEntry = {
  relativePath: string;
  extension: string;
  language: ProjectLanguage;
  kind: "source" | "documentation" | "config" | "asset" | "unknown";
  sizeBytes: number;
  modifiedAt: number;
  depth: number;
  readable: boolean;
};

export type ProjectIndexOptions = { maxDepth?: number; maxFiles?: number };
export type LanguageStat = { language: ProjectLanguage; files: number; bytes: number };
export type FrameworkDetection = {
  name: string;
  confidence: "low" | "medium" | "high";
  evidence: string[];
};
export type ProjectSummary = {
  projectName: string;
  rootPath: string;
  languages: LanguageStat[];
  frameworks: FrameworkDetection[];
  folderCount: number;
  fileCount: number;
  readableFileCount: number;
  gitDetected: boolean;
  readmeSummary: string | null;
  technologyStack: string[];
  entryPoints: string[];
};
export type ProjectIndex = {
  rootPath: string;
  generatedAt: number;
  truncated: boolean;
  maxDepth: number;
  directories: Array<{ relativePath: string; depth: number; ignored?: boolean }>;
  files: ProjectFileEntry[];
  ignoredDirectories: string[];
  gitDetected: boolean;
  frameworks: FrameworkDetection[];
  languages: LanguageStat[];
  summary: ProjectSummary;
};
export type FileChunk = {
  relativePath: string;
  index: number;
  startLine: number;
  endLine: number;
  content: string;
  truncated: boolean;
};
export type ProjectFileRead = {
  relativePath: string;
  language: ProjectLanguage;
  sizeBytes: number;
  modifiedAt: number;
  chunks: FileChunk[];
  truncated: boolean;
};
export type ApplyDiffRequest = {
  rootPath: string;
  relativePath: string;
  expectedBefore: string;
  after: string;
};
export type ApplyDiffResult =
  | { ok: true; backupPath: string; undoToken: string }
  | { ok: false; reason: string };
export type UndoWriteRequest = { rootPath: string; undoToken: string };
export type UndoWriteResult = { ok: true } | { ok: false; reason: string };
