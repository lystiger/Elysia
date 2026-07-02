import type { Workspace } from "../../domain/workspace/workspace";
import { desktopJsonStore, type JsonStore } from "./jsonStore";

const FILE = "workspaces.json";

// Owns durable reads/writes for the workspace collection. Pure persistence —
// no seeding or business rules (those live in WorkspaceService).
export class WorkspaceRepository {
  constructor(private readonly store: JsonStore = desktopJsonStore) {}

  async list(): Promise<Workspace[]> {
    return (await this.store.read<Workspace[]>(FILE)) ?? [];
  }

  async saveAll(workspaces: Workspace[]): Promise<void> {
    await this.store.write(FILE, workspaces);
  }
}
