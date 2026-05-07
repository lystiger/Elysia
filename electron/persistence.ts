import { ipcMain, app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'memory');

export async function initPersistence() {
  // Ensure directory exists (redundant but safe)
  await fs.mkdir(path.join(MEMORY_DIR, 'summaries'), { recursive: true });

  // Handle read requests
  ipcMain.handle('memory:read', async (_, fileName: string) => {
    try {
      const filePath = path.join(MEMORY_DIR, fileName);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  });

  // Handle write requests
  ipcMain.handle('memory:write', async (_, fileName: string, data: any) => {
    const filePath = path.join(MEMORY_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  });

  // Handle listing summaries
  ipcMain.handle('memory:list-summaries', async () => {
    try {
      const summaryDir = path.join(MEMORY_DIR, 'summaries');
      const files = await fs.readdir(summaryDir);
      return files.filter(f => f.endsWith('.json'));
    } catch {
      return [];
    }
  });
}
