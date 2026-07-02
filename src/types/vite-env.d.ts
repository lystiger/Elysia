/// <reference types="vite/client" />

declare global {
  // Read-only folder metadata returned by the main process (no file contents).
  interface FolderScan {
    name: string;
    path: string;
    tree: string;
    fileCount: number;
    extensions: string[];
    truncated: boolean;
  }

  interface Window {
    elysiaDesktop: {
      onFocusInput: (callback: () => void) => () => void;
      getVersion: () => Promise<string>;
      getSystemMemory: () => Promise<{
        total: number;
        free: number;
        swapTotal: number;
        swapFree: number;
      }>;
      memory: {
        read: (fileName: string) => Promise<unknown>;
        write: (fileName: string, data: unknown) => Promise<{ success: true }>;
        listSummaries: () => Promise<string[]>;
      };
      notify: (title: string, body: string) => Promise<void>;
      dialog: {
        pickFolder: () => Promise<string | null>;
      };
      filesystem: {
        scanFolder: (folderPath: string) => Promise<FolderScan | null>;
      };
      onWindowChanged: (callback: (title: string) => void) => () => void;
    };
  }
}

export {};
