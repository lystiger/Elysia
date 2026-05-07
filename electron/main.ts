import { app, BrowserWindow, globalShortcut, ipcMain, Notification } from "electron";
import path from "node:path";
import { initPersistence } from "./persistence";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // Initialize Phase 2 Persistence
  await initPersistence();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1080,
    minHeight: 760,
    backgroundColor: "#050816",
    title: "Elysia",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    void mainWindow.loadURL("http://127.0.0.1:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function registerShortcuts() {
  globalShortcut.register("Shift+O", () => {
    mainWindow?.webContents.send("shortcut:focus-input");
    if (mainWindow !== null && mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow?.focus();
  });
}

app.whenReady().then(() => {
  void createWindow();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle("app:get-version", () => app.getVersion());
ipcMain.handle("system:get-memory", () => process.getSystemMemoryInfo());
ipcMain.handle("app:notify", (_, { title, body }: { title: string; body: string }) => {
  new Notification({ title, body }).show();
});
