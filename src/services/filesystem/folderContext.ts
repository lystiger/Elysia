// Renderer-side filesystem service. All actual disk access happens in the main
// process via the preload bridge — this module only requests it and shapes the
// result into a context message. It reads metadata only, never file contents.

function bridge() {
  return typeof window !== "undefined" ? window.elysiaDesktop : undefined;
}

export async function pickFolder(): Promise<string | null> {
  const desktop = bridge();
  if (!desktop) {
    return null;
  }
  return desktop.dialog.pickFolder();
}

export async function scanFolder(folderPath: string): Promise<FolderScan | null> {
  const desktop = bridge();
  if (!desktop) {
    return null;
  }
  return desktop.filesystem.scanFolder(folderPath);
}

// Builds the lightweight system/context message inserted into a conversation.
// No file contents — only the folder path and a shallow tree of names.
export function buildFolderContextMessage(spaceName: string, scan: FolderScan): string {
  const extensions = scan.extensions.length > 0 ? scan.extensions.join(", ") : "none detected";
  const fileCount = `${scan.fileCount}${scan.truncated ? "+ (truncated)" : ""}`;
  return [
    `You are currently working inside the ${spaceName} Space.`,
    `Folder path: ${scan.path}`,
    `Approximate file count: ${fileCount}. File types: ${extensions}.`,
    `This is lightweight project structure only — file contents have not been read.`,
    ``,
    `Project tree:`,
    scan.tree || "(empty)"
  ].join("\n");
}
