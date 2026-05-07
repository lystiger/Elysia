/// <reference types="vite/client" />

declare global {
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
    };
  }
}

export {};
