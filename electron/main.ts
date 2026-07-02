import { app, BrowserWindow, globalShortcut, ipcMain, Notification } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { initPersistence } from "./persistence";
import { initAwareness } from "./awareness";
import { registerDialogIpc } from "./ipc/dialog";
import { registerFilesystemIpc } from "./ipc/filesystem";
import { registerProjectIntelligenceIpc } from "./project-intelligence/projectIntelligence";

type StoredMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  error?: boolean;
  errorKind?: string;
};

type StoredConversation = {
  id: string;
  title: string;
  createdAt: string | number;
  updatedAt: string | number;
  model: string | null;
  messages: StoredMessage[];
};

type StoredSession = {
  id: string;
  title: string;
  createdAt: string | number;
  updatedAt: string | number;
  model: string | null;
  messageCount: number;
};

const conversationsDir = () => path.join(app.getPath("userData"), "conversations");
const conversationFile = (id: string) => path.join(conversationsDir(), `${id}.json`);
const indexFile = () => path.join(conversationsDir(), "index.json");

async function ensureConversationsDir() {
  await fs.mkdir(conversationsDir(), { recursive: true });
}

async function readIndex(): Promise<StoredSession[]> {
  await ensureConversationsDir();
  try {
    const raw = await fs.readFile(indexFile(), "utf-8");
    return JSON.parse(raw) as StoredSession[];
  } catch {
    return [];
  }
}

async function writeIndex(sessions: StoredSession[]) {
  await ensureConversationsDir();
  await fs.writeFile(indexFile(), JSON.stringify(sessions, null, 2), "utf-8");
}

function toSummary(conversation: StoredConversation): StoredSession {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    model: conversation.model,
    messageCount: conversation.messages.length
  };
}

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

  // Initialize Awareness (Phase 3)
  initAwareness(mainWindow);
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
  registerDialogIpc(() => mainWindow);
  registerFilesystemIpc();
  registerProjectIntelligenceIpc();
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

ipcMain.handle("storage:list", async () => {
  const sessions = await readIndex();
  return [...sessions].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
});

ipcMain.handle("storage:load", async (_event, id: string) => {
  await ensureConversationsDir();
  try {
    const raw = await fs.readFile(conversationFile(id), "utf-8");
    return JSON.parse(raw) as StoredConversation;
  } catch {
    return null;
  }
});

ipcMain.handle("storage:save", async (_event, conversation: StoredConversation) => {
  await ensureConversationsDir();
  await fs.writeFile(conversationFile(conversation.id), JSON.stringify(conversation, null, 2), "utf-8");
  const sessions = await readIndex();
  const next = [...sessions.filter((session) => session.id !== conversation.id), toSummary(conversation)];
  await writeIndex(next);
});

ipcMain.handle("storage:delete", async (_event, id: string) => {
  await ensureConversationsDir();
  await fs.rm(conversationFile(id), { force: true });
  const sessions = await readIndex();
  await writeIndex(sessions.filter((session) => session.id !== id));
});

ipcMain.handle("storage:rename", async (_event, id: string, title: string) => {
  await ensureConversationsDir();
  let raw: string;
  try {
    raw = await fs.readFile(conversationFile(id), "utf-8");
  } catch {
    return;
  }

  const conversation = JSON.parse(raw) as StoredConversation;
  conversation.title = title;
  conversation.updatedAt = new Date().toISOString();
  await fs.writeFile(conversationFile(id), JSON.stringify(conversation, null, 2), "utf-8");

  const sessions = await readIndex();
  await writeIndex(
    sessions.map((session) => (session.id === id ? { ...session, title, updatedAt: conversation.updatedAt } : session))
  );
});
