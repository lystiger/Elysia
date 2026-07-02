import { contextBridge, ipcRenderer } from "electron";
import type { FolderScan } from "./ipc/filesystem";
import type {
  ApplyDiffRequest,
  ApplyDiffResult,
  ProjectFileRead,
  ProjectIndex,
  ProjectIndexOptions,
  UndoWriteRequest,
  UndoWriteResult
} from "./project-intelligence/types";

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
  storage: {
    list: () => ipcRenderer.invoke("storage:list"),
    load: (id: string) => ipcRenderer.invoke("storage:load", id),
    save: (conversation: unknown) => ipcRenderer.invoke("storage:save", conversation) as Promise<void>,
    delete: (id: string) => ipcRenderer.invoke("storage:delete", id) as Promise<void>,
    rename: (id: string, title: string) => ipcRenderer.invoke("storage:rename", id, title) as Promise<void>
  },
  project: {
    setApprovedRoots: (roots: string[]) =>
      ipcRenderer.invoke("project:set-approved-roots", roots) as Promise<void>,
    index: (rootPath: string, options?: ProjectIndexOptions) =>
      ipcRenderer.invoke("project:index", rootPath, options) as Promise<ProjectIndex | null>,
    readFile: (rootPath: string, relativePath: string) =>
      ipcRenderer.invoke("project:read-file", rootPath, relativePath) as Promise<ProjectFileRead | null>,
    applyWrite: (request: ApplyDiffRequest) =>
      ipcRenderer.invoke("project:apply-write", request) as Promise<ApplyDiffResult>,
    undoWrite: (request: UndoWriteRequest) =>
      ipcRenderer.invoke("project:undo-write", request) as Promise<UndoWriteResult>
  },
  onWindowChanged: (callback: (title: string) => void) => {
    const wrapped = (_: any, title: string) => callback(title);
    ipcRenderer.on("awareness:window-changed", wrapped);
    return () => {
      ipcRenderer.removeListener("awareness:window-changed", wrapped);
    };
  }
});
