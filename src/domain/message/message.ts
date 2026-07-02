export type MessageRole = "user" | "assistant" | "system";

export type MessageErrorKind = "offline" | "aborted" | "unknown-model" | "invalid-response" | "unknown";

export type Message = {
  id: string;
  // "system" carries injected context (e.g. lightweight folder metadata) that
  // is prepended to the model prompt but shown distinctly in the transcript.
  role: MessageRole;
  content: string;
  error?: boolean;
  errorKind?: MessageErrorKind;
};
