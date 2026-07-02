import type { Conversation } from "../../domain/conversation/conversation";
import { desktopJsonStore, type JsonStore } from "./jsonStore";

const FILE = "conversations.json";

// Owns durable reads/writes for the conversation collection. Intentionally
// independent of the workspace layer — conversations reference a workspace only
// by id, so this repository can be reused or persisted on its own.
export class ConversationRepository {
  constructor(private readonly store: JsonStore = desktopJsonStore) {}

  async list(): Promise<Conversation[]> {
    return (await this.store.read<Conversation[]>(FILE)) ?? [];
  }

  async saveAll(conversations: Conversation[]): Promise<void> {
    await this.store.write(FILE, conversations);
  }
}
