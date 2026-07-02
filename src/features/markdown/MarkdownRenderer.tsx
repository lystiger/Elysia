import { memo } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

const components: Components = {
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const text = String(children).replace(/\n$/, "");

    if (match?.[1]) {
      return <CodeBlock language={match[1]} code={text} />;
    }

    return <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] text-cyan-100">{children}</code>;
  },
  a({ children, ...props }) {
    return (
      <a {...props} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
};

export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:font-medium prose-p:leading-6 prose-li:leading-6">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
});
