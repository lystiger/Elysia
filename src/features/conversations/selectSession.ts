import { conversationRepository } from "../../services/storage";
import { useAssistantStore } from "../../state/assistantStore";
import { useConversationStore } from "../../state/conversationStore";
import type { Session } from "../../domain/session/session";

// Small orchestration leaf: loads a persisted conversation and applies it to
// both stores. Lives outside conversationStore/assistantStore so neither
// store needs to know about the other.
export async function selectSession(session: Session) {
  const conversation = await conversationRepository.load(session.id);
  if (!conversation) return;

  useConversationStore.getState().setActiveSession(conversation.id, conversation.title, conversation.createdAt);
  useAssistantStore.getState().loadConversationMessages(conversation.messages, conversation.model);
}
