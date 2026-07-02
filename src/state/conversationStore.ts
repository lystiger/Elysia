import { create } from "zustand";
import { conversationRepository } from "../services/storage";
import type { Conversation } from "../domain/conversation/conversation";
import type { Session } from "../domain/session/session";

const DEFAULT_TITLE = "New chat";

type ConversationStore = {
  sessions: Session[];
  activeConversationId: string | null;
  activeConversationTitle: string;
  activeConversationCreatedAt: string | number | null;
  loadSessions: () => Promise<void>;
  beginSession: (model: string) => { id: string; createdAt: string };
  setActiveSession: (id: string, title: string, createdAt: string | number) => void;
  clearActiveSession: () => void;
  syncAfterExchange: (conversation: Conversation) => Promise<void>;
  applyGeneratedTitle: (id: string, title: string) => Promise<void>;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  sessions: [],
  activeConversationId: null,
  activeConversationTitle: DEFAULT_TITLE,
  activeConversationCreatedAt: null,

  loadSessions: async () => {
    const sessions = await conversationRepository.list();
    set({ sessions });
  },

  beginSession: (model) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const summary: Session = {
      id,
      title: DEFAULT_TITLE,
      createdAt: now,
      updatedAt: now,
      model,
      messageCount: 0
    };

    set((state) => ({
      sessions: [summary, ...state.sessions],
      activeConversationId: id,
      activeConversationTitle: DEFAULT_TITLE,
      activeConversationCreatedAt: now
    }));

    return { id, createdAt: now };
  },

  setActiveSession: (id, title, createdAt) => {
    set({ activeConversationId: id, activeConversationTitle: title, activeConversationCreatedAt: createdAt });
  },

  clearActiveSession: () => {
    set({ activeConversationId: null, activeConversationTitle: DEFAULT_TITLE, activeConversationCreatedAt: null });
  },

  syncAfterExchange: async (conversation) => {
    await conversationRepository.save(conversation);

    set((state) => {
      const summary: Session = {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        model: conversation.model,
        messageCount: conversation.messages.length
      };
      const withoutCurrent = state.sessions.filter((session) => session.id !== conversation.id);
      return {
        sessions: [summary, ...withoutCurrent],
        activeConversationTitle:
          state.activeConversationId === conversation.id ? conversation.title : state.activeConversationTitle
      };
    });
  },

  applyGeneratedTitle: async (id, title) => {
    await conversationRepository.rename(id, title);
    set((state) => ({
      sessions: state.sessions.map((session) => (session.id === id ? { ...session, title } : session)),
      activeConversationTitle: state.activeConversationId === id ? title : state.activeConversationTitle
    }));
  }
}));
