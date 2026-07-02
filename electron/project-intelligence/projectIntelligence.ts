import { ipcMain } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  ApplyDiffRequest,
  ApplyDiffResult,
  FileChunk,
  FrameworkDetection,
  LanguageStat,
  ProjectFileEntry,
  ProjectFileRead,
  ProjectIndex,
  ProjectIndexOptions,
  ProjectLanguage,
  ProjectSummary,
  UndoWriteRequest,
  UndoWriteResult
} from "./types";

const IGNORED_PROJECT_DIRECTORIES = [
  ".git",
  "node_modules",
  "build",
  "dist",
  "coverage",
  "target",
  ".venv",
  "__pycache__"
] as const;

const READABLE_EXTENSIONS = new Set([
  ".md", ".markdown", ".txt", ".json", ".yaml", ".yml", ".py", ".js", ".jsx", ".ts", ".tsx",
  ".java", ".c", ".h", ".cpp", ".cc", ".cxx", ".hpp", ".rs", ".go", ".html", ".css"
]);

function languageForExtension(extension: string): ProjectLanguage {
  const languages: Record<string, ProjectLanguage> = {
    ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".jsx": "JavaScript",
    ".py": "Python", ".rs": "Rust", ".c": "C", ".h": "C", ".cpp": "C++", ".cc": "C++",
    ".cxx": "C++", ".hpp": "C++", ".java": "Java", ".go": "Go", ".md": "Markdown",
    ".markdown": "Markdown", ".json": "JSON", ".yaml": "YAML", ".yml": "YAML", ".html": "HTML",
    ".css": "CSS", ".txt": "Text"
  };
  return languages[extension.toLowerCase()] ?? "Other";
}

function kindForPath(relativePath: string, extension: string): ProjectFileEntry["kind"] {
  const lower = relativePath.toLowerCase();
  if (extension === ".md" || extension === ".markdown" || lower.includes("readme")) return "documentation";
  if (extension === ".json" || extension === ".yaml" || extension === ".yml" || lower.endsWith("dockerfile")) return "config";
  if (READABLE_EXTENSIONS.has(extension)) return "source";
  if (/\.(png|jpg|jpeg|gif|webp|svg|pdf|zip|mp4|mp3)$/i.test(lower)) return "asset";
  return "unknown";
}

const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_MAX_FILES = 1200;
const MAX_READ_BYTES = 240_000;
const CHUNK_LINES = 160;
let approvedRoots = new Set<string>();
const undoRecords = new Map<
  string,
  { rootPath: string; targetPath: string; backupPath: string; appliedContent: string }
>();

function normalizeRoot(rootPath: unknown): string | null {
  if (typeof rootPath !== "string" || rootPath.trim().length === 0) {
    return null;
  }
  return path.resolve(rootPath);
}

function approvedRoot(rootPath: unknown): string | null {
  const root = normalizeRoot(rootPath);
  return root && approvedRoots.has(root) ? root : null;
}

function safeProjectPath(rootPath: string, relativePath: string): string | null {
  if (typeof relativePath !== "string" || relativePath.trim().length === 0 || path.isAbsolute(relativePath)) {
    return null;
  }
  const root = path.resolve(rootPath);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  return target;
}

function toRelative(rootPath: string, absolutePath: string): string {
  return path.relative(rootPath, absolutePath).replaceAll(path.sep, "/");
}

function isIgnoredDirectory(name: string): boolean {
  return IGNORED_PROJECT_DIRECTORIES.includes(name as (typeof IGNORED_PROJECT_DIRECTORIES)[number]);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function collectLanguageStats(files: ProjectFileEntry[]): LanguageStat[] {
  const stats = new Map<string, LanguageStat>();
  for (const file of files) {
    const existing = stats.get(file.language) ?? { language: file.language, files: 0, bytes: 0 };
    existing.files += 1;
    existing.bytes += file.sizeBytes;
    stats.set(file.language, existing);
  }
  return [...stats.values()].sort((a, b) => b.files - a.files || b.bytes - a.bytes);
}

function detectFrameworks(files: ProjectFileEntry[]): FrameworkDetection[] {
  const paths = new Set(files.map((file) => file.relativePath.toLowerCase()));
  const detections: FrameworkDetection[] = [];
  const add = (name: string, evidence: string[], confidence: FrameworkDetection["confidence"] = "medium") => {
    const hits = evidence.filter((item) => paths.has(item.toLowerCase()));
    if (hits.length > 0) {
      detections.push({ name, confidence, evidence: hits });
    }
  };

  add("React", ["package.json", "src/app/App.tsx", "src/App.tsx"], "high");
  add("Electron", ["electron/main.ts", "electron/preload.ts"], "high");
  add("Vite", ["vite.config.ts", "vite.config.js"], "high");
  add("Tailwind CSS", ["tailwind.config.ts", "tailwind.config.js"], "high");
  add("Node.js", ["package.json"], "medium");
  add("Rust Cargo", ["Cargo.toml"], "high");
  add("Python", ["pyproject.toml", "requirements.txt"], "medium");
  add("Go Module", ["go.mod"], "high");
  add("Java Maven", ["pom.xml"], "high");
  add("Java Gradle", ["build.gradle", "build.gradle.kts"], "high");

  return detections;
}

function detectEntryPoints(files: ProjectFileEntry[]): string[] {
  const candidates = [
    "src/main.ts",
    "src/main.tsx",
    "src/app/main.tsx",
    "electron/main.ts",
    "main.py",
    "src/main.py",
    "main.rs",
    "src/main.rs",
    "main.go",
    "src/main.java",
    "README.md"
  ];
  const paths = new Set(files.map((file) => file.relativePath));
  return candidates.filter((candidate) => paths.has(candidate));
}

async function summarizeReadme(rootPath: string, files: ProjectFileEntry[]): Promise<string | null> {
  const readme = files.find((file) => /^readme\.m(arkdown|d)$/i.test(file.relativePath));
  if (!readme) {
    return null;
  }
  const target = safeProjectPath(rootPath, readme.relativePath);
  if (!target) {
    return null;
  }
  try {
    const raw = await fs.readFile(target, "utf-8");
    const text = raw.replace(/[#>*_`[\]()]/g, " ").replace(/\s+/g, " ").trim();
    return text.length > 280 ? `${text.slice(0, 277)}...` : text || null;
  } catch {
    return null;
  }
}

async function buildProjectSummary(rootPath: string, files: ProjectFileEntry[], folderCount: number): Promise<ProjectSummary> {
  const languages = collectLanguageStats(files);
  const frameworks = detectFrameworks(files);
  const readmeSummary = await summarizeReadme(rootPath, files);
  const entryPoints = detectEntryPoints(files);
  const technologyStack = [
    ...frameworks.map((framework) => framework.name),
    ...languages.slice(0, 5).map((stat) => stat.language)
  ].filter((value, index, all) => all.indexOf(value) === index);

  return {
    projectName: path.basename(rootPath) || rootPath,
    rootPath,
    languages,
    frameworks,
    folderCount,
    fileCount: files.length,
    readableFileCount: files.filter((file) => file.readable).length,
    gitDetected: await fileExists(path.join(rootPath, ".git")),
    readmeSummary,
    technologyStack,
    entryPoints
  };
}

async function indexProject(rootPath: string, options: ProjectIndexOptions = {}): Promise<ProjectIndex | null> {
  const approved = approvedRoot(rootPath);
  if (!approved) {
    return null;
  }
  const root = approved;
  const rootStats = await fs.stat(root);
  if (!rootStats.isDirectory()) {
    return null;
  }

  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const directories: ProjectIndex["directories"] = [];
  const files: ProjectFileEntry[] = [];
  let truncated = false;

  async function walk(current: string, depth: number): Promise<void> {
    if (truncated || depth > maxDepth) {
      truncated = truncated || depth > maxDepth;
      return;
    }
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    for (const entry of entries) {
      if (files.length >= maxFiles) {
        truncated = true;
        return;
      }
      const absolute = path.join(current, entry.name);
      const relativePath = toRelative(root, absolute);
      if (entry.isDirectory()) {
        const ignored = isIgnoredDirectory(entry.name);
        directories.push({ relativePath, depth, ignored });
        if (!ignored) {
          await walk(absolute, depth + 1);
        }
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      const stat = await fs.stat(absolute);
      const extension = path.extname(entry.name).toLowerCase();
      files.push({
        relativePath,
        extension,
        language: languageForExtension(extension),
        kind: kindForPath(relativePath, extension),
        sizeBytes: stat.size,
        modifiedAt: stat.mtimeMs,
        depth,
        readable: READABLE_EXTENSIONS.has(extension)
      });
    }
  }

  await walk(root, 1);
  const languages = collectLanguageStats(files);
  const frameworks = detectFrameworks(files);
  const summary = await buildProjectSummary(root, files, directories.filter((dir) => !dir.ignored).length);

  return {
    rootPath: root,
    generatedAt: Date.now(),
    truncated,
    maxDepth,
    directories,
    files,
    ignoredDirectories: [...IGNORED_PROJECT_DIRECTORIES],
    gitDetected: summary.gitDetected,
    frameworks,
    languages,
    summary
  };
}

async function readProjectFile(rootPath: string, relativePath: string): Promise<ProjectFileRead | null> {
  const root = approvedRoot(rootPath);
  if (!root) {
    return null;
  }
  const target = safeProjectPath(root, relativePath);
  if (!target) {
    return null;
  }
  const stats = await fs.stat(target);
  if (!stats.isFile()) {
    return null;
  }
  const extension = path.extname(target).toLowerCase();
  if (!READABLE_EXTENSIONS.has(extension)) {
    return null;
  }
  const raw = await fs.readFile(target, "utf-8");
  const truncated = Buffer.byteLength(raw, "utf-8") > MAX_READ_BYTES;
  const content = truncated ? raw.slice(0, MAX_READ_BYTES) : raw;
  const lines = content.split(/\r?\n/);
  const chunks: FileChunk[] = [];
  for (let start = 0; start < lines.length; start += CHUNK_LINES) {
    const slice = lines.slice(start, start + CHUNK_LINES);
    chunks.push({
      relativePath,
      index: chunks.length,
      startLine: start + 1,
      endLine: start + slice.length,
      content: slice.join("\n"),
      truncated: truncated && start + CHUNK_LINES >= lines.length
    });
  }
  return {
    relativePath,
    language: languageForExtension(extension),
    sizeBytes: stats.size,
    modifiedAt: stats.mtimeMs,
    chunks,
    truncated
  };
}

async function applyApprovedWrite(request: ApplyDiffRequest): Promise<ApplyDiffResult> {
  const root = approvedRoot(request.rootPath);
  if (!root) {
    return { ok: false, reason: "Invalid project root." };
  }
  const target = safeProjectPath(root, request.relativePath);
  if (!target) {
    return { ok: false, reason: "Invalid project file path." };
  }
  const stats = await fs.stat(target);
  if (!stats.isFile()) {
    return { ok: false, reason: "Target is not a file." };
  }
  const current = await fs.readFile(target, "utf-8");
  if (current !== request.expectedBefore) {
    return { ok: false, reason: "File changed after the diff was generated. Re-open the preview and try again." };
  }

  const backupDir = path.join(root, ".elysia", "backups");
  await fs.mkdir(backupDir, { recursive: true });
  const safeName = request.relativePath.replace(/[\\/:"*?<>|]+/g, "__");
  const undoToken = `${Date.now()}-${safeName}`;
  const backupPath = path.join(backupDir, `${undoToken}.bak`);
  await fs.writeFile(backupPath, current, "utf-8");

  const tempPath = `${target}.elysia-${Date.now()}.tmp`;
  await fs.writeFile(tempPath, request.after, "utf-8");
  await fs.rename(tempPath, target);
  undoRecords.set(undoToken, {
    rootPath: root,
    targetPath: target,
    backupPath,
    appliedContent: request.after
  });
  return { ok: true, backupPath, undoToken };
}

async function undoApprovedWrite(request: UndoWriteRequest): Promise<UndoWriteResult> {
  const root = approvedRoot(request.rootPath);
  const record = undoRecords.get(request.undoToken);
  if (!root || !record || record.rootPath !== root) {
    return { ok: false, reason: "Undo record is unavailable or outside the approved Space." };
  }
  const current = await fs.readFile(record.targetPath, "utf-8");
  if (current !== record.appliedContent) {
    return { ok: false, reason: "File changed after Elysia applied the proposal. Undo was stopped to protect newer work." };
  }
  const original = await fs.readFile(record.backupPath, "utf-8");
  const tempPath = `${record.targetPath}.elysia-undo-${Date.now()}.tmp`;
  await fs.writeFile(tempPath, original, "utf-8");
  await fs.rename(tempPath, record.targetPath);
  undoRecords.delete(request.undoToken);
  return { ok: true };
}

export function registerProjectIntelligenceIpc(): void {
  ipcMain.handle("project:set-approved-roots", (_event, roots: unknown) => {
    if (!Array.isArray(roots)) {
      approvedRoots = new Set();
      return;
    }
    approvedRoots = new Set(
      roots
        .filter((root): root is string => typeof root === "string" && root.trim().length > 0)
        .map((root) => path.resolve(root))
    );
  });

  ipcMain.handle("project:index", async (_event, rootPath: unknown, options?: ProjectIndexOptions) => {
    if (typeof rootPath !== "string") {
      return null;
    }
    return indexProject(rootPath, options);
  });

  ipcMain.handle("project:read-file", async (_event, rootPath: unknown, relativePath: unknown) => {
    if (typeof rootPath !== "string" || typeof relativePath !== "string") {
      return null;
    }
    try {
      return await readProjectFile(rootPath, relativePath);
    } catch {
      return null;
    }
  });

  ipcMain.handle("project:apply-write", async (_event, request: ApplyDiffRequest) => {
    try {
      return await applyApprovedWrite(request);
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : "Unable to apply approved write."
      } satisfies ApplyDiffResult;
    }
  });

  ipcMain.handle("project:undo-write", async (_event, request: UndoWriteRequest) => {
    try {
      return await undoApprovedWrite(request);
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : "Unable to undo the approved write."
      } satisfies UndoWriteResult;
    }
  });
}
