import type { Conversation } from "../../domain/conversation/conversation";
import { GENERAL_SPACE_ID } from "../../domain/space/space";
import { desktopJsonStore, type JsonStore } from "./jsonStore";

const FILE = "conversations.json";

// Owns durable reads/writes for the conversation collection. Intentionally
// independent of the Space layer — conversations reference a Space only by id,
// so this repository can be reused or persisted on its own.
export class ConversationRepository {
  constructor(private readonly store: JsonStore = desktopJsonStore) {}

  async list(): Promise<Conversation[]> {
    const stored = (await this.store.read<Array<Conversation & { workspaceId?: string }>>(FILE)) ?? [];
    let migrated = false;
    const conversations = stored.map((conversation) => {
      if (conversation.spaceId) {
        return conversation;
      }
      migrated = true;
      const { workspaceId, ...rest } = conversation;
      return {
        ...rest,
        spaceId: workspaceId || GENERAL_SPACE_ID
      } as Conversation;
    });
    if (migrated) {
      await this.saveAll(conversations);
    }
    return conversations;
  }

  async saveAll(conversations: Conversation[]): Promise<void> {
    await this.store.write(FILE, conversations);
  }
}
