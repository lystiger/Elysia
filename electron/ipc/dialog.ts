import { BrowserWindow, dialog, ipcMain } from "electron";

// Native folder picker exposed to the renderer through IPC. The renderer never
// touches Node or the filesystem directly — it only receives the chosen path.
export function registerDialogIpc(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle("dialog:pick-folder", async (): Promise<string | null> => {
    const win = getWindow();
    const result = win
      ? await dialog.showOpenDialog(win, {
          title: "Add folder as Space",
          properties: ["openDirectory"]
        })
      : await dialog.showOpenDialog({
          title: "Add folder as Space",
          properties: ["openDirectory"]
        });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0] ?? null;
  });
}
