import { streamFromOllama } from "./ollama";

export async function generateSessionSummary(
  model: string,
  sessionTitle: string,
  objective: string,
  durationMinutes: number,
  history: string
): Promise<string> {
  const prompt = `
    You are Elysia, a productivity assistant.
    Summarize the following focus session.

    Session Title: ${sessionTitle}
    Objective: ${objective}
    Duration: ${durationMinutes} minutes

    Conversation History:
    ${history}

    Provide a concise summary of accomplishments, key topics discussed, and any pending tasks.
    Keep the tone professional and focused.
    Return ONLY the summary text.
  `;

  let fullSummary = "";

  await streamFromOllama({
    model,
    prompt,
    onToken: (token) => {
      fullSummary += token;
    }
  });

  return fullSummary.trim();
}
