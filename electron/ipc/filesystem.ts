import { ipcMain } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";

// Lightweight, read-only folder metadata. This deliberately never reads file
// contents, never writes, and never runs commands — it only lists directory
// entries so a Space can describe its bound project.
export type FolderScan = {
  name: string;
  path: string;
  tree: string;
  fileCount: number;
  extensions: string[];
  truncated: boolean;
};

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".venv",
  "__pycache__",
  "target",
  "coverage"
]);

const MAX_DEPTH = 3;
const MAX_FILES = 300;

async function scanFolder(root: string): Promise<FolderScan> {
  const lines: string[] = [];
  const extensions = new Set<string>();
  let fileCount = 0;
  let truncated = false;

  async function walk(dir: string, depth: number, prefix: string): Promise<void> {
    if (truncated) {
      return;
    }
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return; // Unreadable directory — skip rather than fail the whole scan.
    }

    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    for (const entry of entries) {
      if (fileCount >= MAX_FILES) {
        truncated = true;
        return;
      }

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          lines.push(`${prefix}${entry.name}/ (ignored)`);
          continue;
        }
        lines.push(`${prefix}${entry.name}/`);
        if (depth < MAX_DEPTH) {
          await walk(path.join(dir, entry.name), depth + 1, `${prefix}  `);
        }
      } else if (entry.isFile()) {
        fileCount += 1;
        const ext = path.extname(entry.name).toLowerCase();
        if (ext) {
          extensions.add(ext);
        }
        lines.push(`${prefix}${entry.name}`);
      }
    }
  }

  await walk(root, 1, "");

  return {
    name: path.basename(root) || root,
    path: root,
    tree: lines.join("\n"),
    fileCount,
    extensions: [...extensions].sort(),
    truncated
  };
}

export function registerFilesystemIpc(): void {
  ipcMain.handle("fs:scan-folder", async (_event, folderPath: unknown): Promise<FolderScan | null> => {
    if (typeof folderPath !== "string" || folderPath.trim().length === 0) {
      return null;
    }
    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        return null;
      }
      return await scanFolder(folderPath);
    } catch {
      return null;
    }
  });
}
