// Local JSON persistence adapter.
//
// Repositories depend on this narrow interface rather than the global desktop
// bridge directly, so storage can be swapped (tests, alternative backends)
// without touching repository logic. The default implementation writes through
// the context-isolated preload bridge to files under `data/memory/`.

export interface JsonStore {
  read<T>(file: string): Promise<T | null>;
  write<T>(file: string, data: T): Promise<void>;
}

export const desktopJsonStore: JsonStore = {
  async read<T>(file: string): Promise<T | null> {
    const bridge = typeof window !== "undefined" ? window.elysiaDesktop : undefined;
    if (!bridge) {
      return null;
    }
    const data = (await bridge.memory.read(file)) as T | null;
    return data ?? null;
  },
  async write<T>(file: string, data: T): Promise<void> {
    const bridge = typeof window !== "undefined" ? window.elysiaDesktop : undefined;
    if (!bridge) {
      return;
    }
    await bridge.memory.write(file, data);
  }
};
