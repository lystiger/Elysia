import { contextBridge, ipcRenderer } from "electron";
import type { FolderScan } from "./ipc/filesystem";

contextBridge.exposeInMainWorld("elysiaDesktop", {
  onFocusInput: (callback: () => void) => {
    const wrapped = () => callback();
    ipcRenderer.on("shortcut:focus-input", wrapped);

    return () => {
      ipcRenderer.removeListener("shortcut:focus-input", wrapped);
    };
  },
  getVersion: () => ipcRenderer.invoke("app:get-version") as Promise<string>,
  getSystemMemory: () =>
    ipcRenderer.invoke("system:get-memory") as Promise<{
      total: number;
      free: number;
      swapTotal: number;
      swapFree: number;
    }>,
  memory: {
    read: (fileName: string) => ipcRenderer.invoke("memory:read", fileName),
    write: (fileName: string, data: unknown) => ipcRenderer.invoke("memory:write", fileName, data),
    listSummaries: () => ipcRenderer.invoke("memory:list-summaries")
  },
  notify: (title: string, body: string) => ipcRenderer.invoke("app:notify", { title, body }),
  dialog: {
    pickFolder: () => ipcRenderer.invoke("dialog:pick-folder") as Promise<string | null>
  },
  filesystem: {
    scanFolder: (folderPath: string) =>
      ipcRenderer.invoke("fs:scan-folder", folderPath) as Promise<FolderScan | null>
  },
  onWindowChanged: (callback: (title: string) => void) => {
    const wrapped = (_: any, title: string) => callback(title);
    ipcRenderer.on("awareness:window-changed", wrapped);
    return () => {
      ipcRenderer.removeListener("awareness:window-changed", wrapped);
    };
  }
});
