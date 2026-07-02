import { JsonConversationRepository } from "./JsonConversationRepository";

export const conversationRepository = new JsonConversationRepository();
export type { ConversationRepository } from "./ConversationRepository";
