import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("elysiaDesktop", {
  onFocusInput: (callback: () => void) => {
    const wrapped = () => callback();
    ipcRenderer.on("shortcut:focus-input", wrapped);

    return () => {
      ipcRenderer.removeListener("shortcut:focus-input", wrapped);
    };
  },
  getVersion: () => ipcRenderer.invoke("app:get-version") as Promise<string>
});
