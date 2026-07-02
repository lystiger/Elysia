// Conversation domain model.
//
// A conversation belongs to exactly one Space and owns its messages plus
// project metadata. Space logic is kept separate from conversation logic — a
// conversation only references a Space by id.

import type { Message } from "../message/message";

export type Conversation = {
  id: string;
  spaceId: string;
  title: string;
  model: string | null;
  messages: Message[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, unknown>;
};

const DEFAULT_TITLE = "New chat";

export function createConversation(
  spaceId: string,
  title: string = DEFAULT_TITLE,
  model: string | null = null
): Conversation {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    spaceId,
    title: title.trim() || DEFAULT_TITLE,
    model,
    messages: [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
    metadata: {}
  };
}

export function isUntitled(conversation: Conversation): boolean {
  return conversation.title === DEFAULT_TITLE || conversation.title.trim().length === 0;
}

export function deriveTitle(prompt: string): string {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  if (normalized.length === 0) {
    return DEFAULT_TITLE;
  }
  return normalized.length <= 48 ? normalized : `${normalized.slice(0, 47)}…`;
}

const byUpdatedDesc = (a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt;

export function conversationsForSpace(conversations: Conversation[], spaceId: string): Conversation[] {
  return conversations.filter((c) => c.spaceId === spaceId).sort(byUpdatedDesc);
}

export function recentConversations(conversations: Conversation[], limit = 6): Conversation[] {
  return [...conversations].sort(byUpdatedDesc).slice(0, limit);
}

export function pinnedConversations(conversations: Conversation[]): Conversation[] {
  return conversations.filter((c) => c.pinned).sort(byUpdatedDesc);
}

export type SpaceStats = {
  count: number;
  lastActivity: number | null;
  recentModel: string | null;
  lastConversation: Conversation | null;
};

export function spaceStats(conversations: Conversation[], spaceId: string): SpaceStats {
  const list = conversationsForSpace(conversations, spaceId);
  const last = list[0] ?? null;
  return {
    count: list.length,
    lastActivity: last?.updatedAt ?? null,
    recentModel: last?.model ?? null,
    lastConversation: last
  };
}

export function conversationMatches(conversation: Conversation, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return true;
  }
  if (conversation.title.toLowerCase().includes(q)) {
    return true;
  }
  return conversation.messages.some((m) => m.content.toLowerCase().includes(q));
}
