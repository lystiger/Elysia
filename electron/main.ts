import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "node:path";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
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
  createWindow();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
