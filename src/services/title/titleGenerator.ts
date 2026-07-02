import { streamFromOllama } from "../ollama";

const MAX_TITLE_WORDS = 5;

// Isolated on purpose: this module only knows how to turn a finished
// exchange into a short title. It has no idea a conversation store, a
// repository, or a sidebar exist.
export async function generateTitle(params: {
  userMessage: string;
  assistantMessage: string;
  model: string;
}): Promise<string> {
  const { userMessage, assistantMessage, model } = params;
  const prompt = [
    "Summarize the topic of this exchange as a short title of 2-5 words.",
    "No punctuation, no quotes, no \"Title:\" prefix — respond with only the title itself.",
    "",
    `User: ${truncate(userMessage, 400)}`,
    `Assistant: ${truncate(assistantMessage, 400)}`
  ].join("\n");

  try {
    let raw = "";
    await streamFromOllama({
      model,
      prompt,
      onToken: (token) => {
        raw += token;
      }
    });

    const cleaned = sanitizeTitle(raw);
    return cleaned.length > 0 ? cleaned : fallbackTitle(userMessage);
  } catch {
    return fallbackTitle(userMessage);
  }
}

function sanitizeTitle(raw: string): string {
  return raw
    .replace(/["'.\n]/g, " ")
    .replace(/^title:\s*/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TITLE_WORDS)
    .join(" ");
}

function fallbackTitle(userMessage: string): string {
  const words = userMessage.trim().split(/\s+/).filter(Boolean).slice(0, MAX_TITLE_WORDS).join(" ");
  return words.length > 0 ? words : "New chat";
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
