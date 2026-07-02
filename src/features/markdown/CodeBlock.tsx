import { memo } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./CopyButton";
import { ensureLanguagesRegistered } from "./registerLanguages";

ensureLanguagesRegistered();

export const CodeBlock = memo(function CodeBlock({ language, code }: { language: string; code: string }) {
  const label = language.length > 0 ? language : "text";

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1e]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <CopyButton text={code} />
      </div>
      <div className="scrollbar-thin max-h-[28rem] overflow-auto">
        <SyntaxHighlighter
          language={label}
          style={oneDark}
          customStyle={{ margin: 0, background: "transparent", padding: "1rem", fontSize: "0.8125rem" }}
          codeTagProps={{ style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});
