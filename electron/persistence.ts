import { ipcMain } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

const MEMORY_DIR = path.resolve(process.cwd(), "data", "memory");
let initialized = false;

function memoryPath(fileName: unknown): string {
  if (typeof fileName !== "string" || fileName.trim().length === 0) {
    throw new Error("A valid memory file name is required.");
  }
  const resolved = path.resolve(MEMORY_DIR, fileName);
  if (resolved !== MEMORY_DIR && !resolved.startsWith(`${MEMORY_DIR}${path.sep}`)) {
    throw new Error("Memory path must stay inside the application data directory.");
  }
  return resolved;
}

export async function initPersistence(): Promise<void> {
  if (initialized) {
    return;
  }
  await fs.mkdir(path.join(MEMORY_DIR, "summaries"), { recursive: true });
  initialized = true;

  ipcMain.handle("memory:read", async (_, fileName: unknown) => {
    try {
      const filePath = memoryPath(fileName);
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  });

  ipcMain.handle("memory:write", async (_, fileName: unknown, data: unknown) => {
    const filePath = memoryPath(fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return { success: true };
  });

  ipcMain.handle("memory:list-summaries", async () => {
    try {
      const summaryDir = path.join(MEMORY_DIR, "summaries");
      const files = await fs.readdir(summaryDir);
      return files.filter((file) => file.endsWith(".json"));
    } catch {
      return [];
    }
  });
}
