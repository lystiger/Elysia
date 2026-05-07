import { ipcMain } from 'electron';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

let monitoringInterval: NodeJS.Timeout | null = null;
let lastActiveWindow = '';

export function initAwareness(mainWindow: Electron.BrowserWindow) {
  ipcMain.handle('awareness:get-active-window', async () => {
    return await getActiveWindowTitle();
  });

  // Start polling every 5 seconds
  if (monitoringInterval) clearInterval(monitoringInterval);
  
  monitoringInterval = setInterval(async () => {
    const currentWindow = await getActiveWindowTitle();
    if (currentWindow !== lastActiveWindow) {
      lastActiveWindow = currentWindow;
      mainWindow.webContents.send('awareness:window-changed', currentWindow);
    }
  }, 5000);
}

async function getActiveWindowTitle(): Promise<string> {
  try {
    // Linux specific command to get the active window title
    const { stdout } = await execAsync('xprop -id $(xprop -root _NET_ACTIVE_WINDOW | cut -d " " -f 5) WM_NAME');
    const match = stdout.match(/WM_NAME\(STRING\) = "(.*)"/);
    return match ? match[1] : 'Unknown';
  } catch (error) {
    // Fallback if xprop fails or isn't available
    return 'Desktop';
  }
}
