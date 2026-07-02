// A Session is the lightweight sidebar-facing projection of a Conversation —
// everything except the message bodies, so listing sessions never requires
// loading full conversation content.
export type Session = {
  id: string;
  title: string;
  createdAt: string | number;
  updatedAt: string | number;
  model: string | null;
  messageCount: number;
};
