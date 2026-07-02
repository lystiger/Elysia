/// <reference types="vite/client" />

import type { Conversation } from "../domain/conversation/conversation";
import type { Session } from "../domain/session/session";

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
      storage: {
        list: () => Promise<Session[]>;
        load: (id: string) => Promise<Conversation | null>;
        save: (conversation: Conversation) => Promise<void>;
        delete: (id: string) => Promise<void>;
        rename: (id: string, title: string) => Promise<void>;
      };
      onWindowChanged: (callback: (title: string) => void) => () => void;
    };
  }
}

export {};
