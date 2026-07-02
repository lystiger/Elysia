export type Message = {
  id: string;
  // "system" carries injected context (e.g. lightweight folder metadata) that
  // is prepended to the model prompt but shown distinctly in the transcript.
  role: "user" | "assistant" | "system";
  content: string;
};
