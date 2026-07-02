import { BookOpen, Cpu, Folder, Hand, MessageCircle, ScanEye, Sparkles, type LucideIcon } from "lucide-react";
import type { WorkspaceIcon as WorkspaceIconModel } from "../../domain/workspace/workspace";

// Explicit registry keeps the icon set tree-shakeable and avoids dynamic
// name-to-component lookups from bundling every Lucide glyph.
const LUCIDE: Record<string, LucideIcon> = {
  MessageCircle,
  ScanEye,
  Cpu,
  Hand,
  Sparkles,
  BookOpen,
  Folder
};

type WorkspaceIconProps = {
  icon: WorkspaceIconModel;
  className?: string;
};

// Renders a workspace's identity across the supported icon kinds: emoji,
// Lucide glyph, or raw SVG markup.
export function WorkspaceIcon({ icon, className }: WorkspaceIconProps) {
  if (icon.kind === "emoji") {
    return (
      <span className={className} style={{ lineHeight: 1 }} aria-hidden>
        {icon.value}
      </span>
    );
  }
  if (icon.kind === "svg") {
    return <span className={className} aria-hidden dangerouslySetInnerHTML={{ __html: icon.value }} />;
  }
  const Glyph = LUCIDE[icon.value] ?? Folder;
  return <Glyph className={className} aria-hidden />;
}
