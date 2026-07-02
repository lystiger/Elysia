import {
  BookOpen,
  Cpu,
  Folder,
  FolderGit2,
  Hand,
  MessageCircle,
  ScanEye,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import type { SpaceIcon as SpaceIconModel } from "../../domain/space/space";

const LUCIDE: Record<string, LucideIcon> = {
  MessageCircle,
  Folder,
  FolderGit2,
  ScanEye,
  Cpu,
  Hand,
  Sparkles,
  BookOpen
};

type SpaceIconProps = {
  icon: SpaceIconModel;
  className?: string;
};

// Renders a Space's identity across the supported icon kinds: emoji, Lucide
// glyph, or raw SVG markup.
export function SpaceIcon({ icon, className }: SpaceIconProps) {
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
