import type { Conversation } from "../../domain/conversation/conversation";
import type { Session } from "../../domain/session/session";

// Renderer-side repository. Delegates the actual file I/O to the Electron
// main process (over IPC) since the renderer has no direct filesystem
// access — the JSON encoding lives entirely on the main-process side.
export class JsonConversationRepository {
  async list(): Promise<Session[]> {
    return window.elysiaDesktop.storage.list();
  }

  async load(id: string): Promise<Conversation | null> {
    return window.elysiaDesktop.storage.load(id);
  }

  async save(conversation: Conversation): Promise<void> {
    await window.elysiaDesktop.storage.save(conversation);
  }

  async delete(id: string): Promise<void> {
    await window.elysiaDesktop.storage.delete(id);
  }

  async rename(id: string, title: string): Promise<void> {
    await window.elysiaDesktop.storage.rename(id, title);
  }
}
