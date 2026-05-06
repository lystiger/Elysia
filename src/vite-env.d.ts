/// <reference types="vite/client" />

declare global {
  interface Window {
    elysiaDesktop: {
      onFocusInput: (callback: () => void) => () => void;
      getVersion: () => Promise<string>;
    };
  }
}

export {};
