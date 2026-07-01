import { contextBridge, ipcRenderer } from "electron";

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
    }>
});
