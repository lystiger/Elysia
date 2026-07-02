import type { MarkdownFinding } from "../../types/project";

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length;
}

export function analyzeMarkdown(relativePath: string, content: string): MarkdownFinding[] {
  const findings: MarkdownFinding[] = [];
  const headings = new Map<string, number>();
  let previousLevel = 0;
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const marker = heading[1];
      const headingText = heading[2];
      if (!marker || !headingText) {
        return;
      }
      const level = marker.length;
      const title = headingText.trim().toLowerCase();
      if (previousLevel > 0 && level > previousLevel + 1) {
        findings.push({
          relativePath,
          kind: "skipped-heading-level",
          line: lineNo,
          message: `Heading jumps from H${previousLevel} to H${level}.`,
          severity: "warning"
        });
      }
      previousLevel = level;
      const previous = headings.get(title);
      if (previous) {
        findings.push({
          relativePath,
          kind: "duplicate-heading",
          line: lineNo,
          message: `Duplicate heading also appears on line ${previous}.`,
          severity: "warning"
        });
      } else {
        headings.set(title, lineNo);
      }
    }

    if (/^```\s*$/.test(line)) {
      findings.push({
        relativePath,
        kind: "missing-code-fence-language",
        line: lineNo,
        message: "Code fence has no language tag.",
        severity: "info"
      });
    }
  });

  const localLinks = [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)];
  for (const match of localLinks) {
    const target = match[1];
    if (!target || /^(https?:|mailto:|#)/.test(target)) {
      continue;
    }
    if (target.includes(" ")) {
      findings.push({
        relativePath,
        kind: "broken-link",
        line: lineNumberAt(content, match.index ?? 0),
        message: `Link target "${target}" contains spaces and may be broken.`,
        severity: "info"
      });
    }
  }

  const notationHits = ["boolean", "Boolean", "bool", "Bool"].filter((term) => content.includes(term));
  if (notationHits.length >= 3) {
    findings.push({
      relativePath,
      kind: "inconsistent-notation",
      line: 1,
      message: `Possible inconsistent notation: ${notationHits.join(", ")}.`,
      severity: "info"
    });
  }

  return findings;
}
