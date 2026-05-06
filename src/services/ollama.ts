import axios from "axios";

type OllamaChunk = {
  response?: string;
  done?: boolean;
  error?: string;
};

type GenerateParams = {
  model: string;
  prompt: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
};

const DEFAULT_ENDPOINT = "http://localhost:11434";

export async function streamFromOllama({
  model,
  prompt,
  signal,
  onToken
}: GenerateParams) {
  const response = await fetch(`${DEFAULT_ENDPOINT}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: true
    }),
    signal
  });

  if (!response.ok || response.body === null) {
    throw new Error(`Ollama request failed with status ${response.status}.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length === 0) {
        continue;
      }

      const chunk = JSON.parse(trimmed) as OllamaChunk;
      if (chunk.error) {
        throw new Error(chunk.error);
      }

      if (chunk.response) {
        onToken(chunk.response);
      }
    }
  }
}

export async function verifyOllama(model: string) {
  await axios.post(`${DEFAULT_ENDPOINT}/api/show`, { model });
}
