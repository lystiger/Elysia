import type { DiffProposal } from "../../types/project";

function lines(value: string): string[] {
  return value.replace(/\r\n/g, "\n").split("\n");
}

export function createUnifiedDiff(relativePath: string, before: string, after: string): string {
  const beforeLines = lines(before);
  const afterLines = lines(after);
  const output = [`--- a/${relativePath}`, `+++ b/${relativePath}`];
  const max = Math.max(beforeLines.length, afterLines.length);

  output.push(`@@ -1,${beforeLines.length} +1,${afterLines.length} @@`);
  for (let index = 0; index < max; index += 1) {
    const beforeLine = beforeLines[index];
    const afterLine = afterLines[index];
    if (beforeLine === afterLine && beforeLine !== undefined) {
      output.push(` ${beforeLine}`);
    } else {
      if (beforeLine !== undefined) {
        output.push(`-${beforeLine}`);
      }
      if (afterLine !== undefined) {
        output.push(`+${afterLine}`);
      }
    }
  }
  return output.join("\n");
}

function readBlock(source: string, label: string, nextLabels: string[]): string | null {
  const start = source.indexOf(`${label}:`);
  if (start === -1) {
    return null;
  }
  const contentStart = start + label.length + 1;
  const next = nextLabels
    .map((nextLabel) => source.indexOf(`${nextLabel}:`, contentStart))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  return source.slice(contentStart, next ?? source.length).trim();
}

export function extractDiffProposals(response: string): DiffProposal[] {
  const proposals: DiffProposal[] = [];
  const blocks = [...response.matchAll(/```ELYSIA_DIFF\s*([\s\S]*?)```/g)];

  for (const block of blocks) {
    const body = block[1]?.trim();
    if (!body) {
      continue;
    }
    const relativePath = /^File:\s*(.+)$/m.exec(body)?.[1]?.trim();
    const title = /^Title:\s*(.+)$/m.exec(body)?.[1]?.trim() ?? "Proposed project edit";
    const summary = /^Summary:\s*(.+)$/m.exec(body)?.[1]?.trim() ?? "Review this change before applying.";
    const before = readBlock(body, "Before", ["After"]);
    const after = readBlock(body, "After", []);
    if (!relativePath || before === null || after === null || before === after) {
      continue;
    }
    proposals.push({
      id: crypto.randomUUID(),
      relativePath,
      title,
      summary,
      before,
      after,
      unifiedDiff: createUnifiedDiff(relativePath, before, after),
      status: "pending"
    });
  }

  return proposals;
}
