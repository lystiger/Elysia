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
    };
  }
}

export {};
