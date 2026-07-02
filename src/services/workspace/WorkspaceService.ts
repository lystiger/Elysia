import { defaultWorkspaces, type Workspace } from "../../domain/workspace/workspace";
import type { Conversation } from "../../domain/conversation/conversation";
import { WorkspaceRepository } from "../storage/WorkspaceRepository";
import { ConversationRepository } from "../storage/ConversationRepository";

export type WorkspaceSnapshot = {
  workspaces: Workspace[];
  conversations: Conversation[];
};

// Orchestrates the two independent repositories and owns first-run seeding.
// Keeps the store thin: the store holds in-memory state and delegates all
// durable reads/writes here.
export class WorkspaceService {
  constructor(
    private readonly workspaceRepo = new WorkspaceRepository(),
    private readonly conversationRepo = new ConversationRepository()
  ) {}

  async load(): Promise<WorkspaceSnapshot> {
    let workspaces = await this.workspaceRepo.list();
    if (workspaces.length === 0) {
      workspaces = defaultWorkspaces();
      await this.workspaceRepo.saveAll(workspaces);
    }
    const conversations = await this.conversationRepo.list();
    return { workspaces, conversations };
  }

  async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
    await this.workspaceRepo.saveAll(workspaces);
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    await this.conversationRepo.saveAll(conversations);
  }
}

export const workspaceService = new WorkspaceService();
