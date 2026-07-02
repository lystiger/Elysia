import type { ProjectFileEntry, ProjectIndex, RelevantFile } from "../../types/project";

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "explain",
  "find",
  "for",
  "give",
  "help",
  "how",
  "improve",
  "in",
  "is",
  "me",
  "my",
  "of",
  "on",
  "please",
  "polish",
  "project",
  "review",
  "summarize",
  "the",
  "this",
  "to",
  "what"
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[_./\\-]+/g, " ")
    .split(/[^a-z0-9+#]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function fileTokens(file: ProjectFileEntry): string[] {
  return tokenize(`${file.relativePath} ${file.language} ${file.kind} ${file.extension}`);
}

function intentBoost(prompt: string, file: ProjectFileEntry): { score: number; reasons: string[] } {
  const lower = prompt.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  if (/(note|notes|thesis|readme|documentation|markdown|lecture|boolean|proof)/.test(lower) && file.kind === "documentation") {
    score += 8;
    reasons.push("documentation intent");
  }
  if (/(architecture|entry|structure|explain|overview)/.test(lower) && (file.kind === "source" || /readme/i.test(file.relativePath))) {
    score += 4;
    reasons.push("architecture intent");
  }
  if (/(config|package|dependency|framework)/.test(lower) && file.kind === "config") {
    score += 4;
    reasons.push("configuration intent");
  }
  if (/boolean|logic|truth|gate|algebra/.test(lower) && /boolean|logic|truth|gate|algebra/i.test(file.relativePath)) {
    score += 12;
    reasons.push("boolean/logic filename match");
  }
  if (/readme/.test(lower) && /readme/i.test(file.relativePath)) {
    score += 12;
    reasons.push("README requested");
  }

  return { score, reasons };
}

export function findRelevantFiles(index: ProjectIndex, prompt: string, limit = 24): RelevantFile[] {
  const promptTokens = tokenize(prompt);
  const relevant = index.files
    .filter((file) => file.readable)
    .map((file) => {
      const tokens = fileTokens(file);
      const overlap = promptTokens.filter((token) => tokens.some((item) => item.includes(token) || token.includes(item)));
      const reasons = overlap.map((token) => `matched "${token}"`);
      let score = overlap.length * 6;
      const boost = intentBoost(prompt, file);
      score += boost.score;
      reasons.push(...boost.reasons);

      if (/readme/i.test(file.relativePath)) {
        score += 2;
        reasons.push("project overview file");
      }
      if (file.depth <= 2) {
        score += 1;
      }
      if (file.sizeBytes > 180_000) {
        score -= 3;
      }

      return { file, score, reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.file.relativePath.localeCompare(b.file.relativePath))
    .slice(0, Math.min(limit, 50));

  if (relevant.length > 0) {
    return relevant;
  }

  return index.files
    .filter((file) => file.readable && (file.kind === "documentation" || /readme/i.test(file.relativePath)))
    .slice(0, Math.min(8, limit))
    .map((file) => ({ file, score: 1, reasons: ["fallback documentation context"] }));
}
