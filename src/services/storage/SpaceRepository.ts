import {
  createSpace,
  defaultSpaces,
  touchSpace,
  GENERAL_SPACE_ID,
  type CreateSpaceInput,
  type Space
} from "../../domain/space/space";
import { desktopJsonStore, type JsonStore } from "./jsonStore";

// Storage abstraction for Spaces. The interface is deliberately record-oriented
// (get / create / update / delete) rather than bulk saveAll, so a SQLite-backed
// implementation can drop in later without changing callers.
export interface SpaceRepository {
  list(): Promise<Space[]>;
  get(id: string): Promise<Space | null>;
  create(input: CreateSpaceInput): Promise<Space>;
  update(id: string, patch: Partial<Space>): Promise<Space | null>;
  delete(id: string): Promise<void>;
  setActive(id: string): Promise<void>;
  getActive(): Promise<Space | null>;
}

const SPACES_FILE = "spaces.json";
const ACTIVE_FILE = "space-active.json";

export class JsonSpaceRepository implements SpaceRepository {
  constructor(private readonly store: JsonStore = desktopJsonStore) {}

  async list(): Promise<Space[]> {
    let spaces = (await this.store.read<Space[]>(SPACES_FILE)) ?? [];
    // General always exists — seed it if the store has never been written or a
    // previous version dropped it.
    if (!spaces.some((space) => space.id === GENERAL_SPACE_ID)) {
      spaces = [...defaultSpaces(), ...spaces];
      await this.store.write(SPACES_FILE, spaces);
    }
    return spaces;
  }

  async get(id: string): Promise<Space | null> {
    const spaces = await this.list();
    return spaces.find((space) => space.id === id) ?? null;
  }

  async create(input: CreateSpaceInput): Promise<Space> {
    const spaces = await this.list();
    const space = createSpace(input);
    await this.store.write(SPACES_FILE, [...spaces, space]);
    return space;
  }

  async update(id: string, patch: Partial<Space>): Promise<Space | null> {
    const spaces = await this.list();
    let updated: Space | null = null;
    const next = spaces.map((space) => {
      if (space.id !== id) {
        return space;
      }
      const nextPatch = {
        ...patch,
        id: space.id,
        createdAt: space.createdAt,
        ...(space.id === GENERAL_SPACE_ID
          ? { folderPath: null, isPinned: true }
          : {})
      };
      updated = touchSpace(space, nextPatch);
      return updated;
    });
    if (updated) {
      await this.store.write(SPACES_FILE, next);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (id === GENERAL_SPACE_ID) {
      return; // General can never be removed.
    }
    const spaces = await this.list();
    await this.store.write(
      SPACES_FILE,
      spaces.filter((space) => space.id !== id)
    );
  }

  async setActive(id: string): Promise<void> {
    await this.store.write(ACTIVE_FILE, { id });
  }

  async getActive(): Promise<Space | null> {
    const record = await this.store.read<{ id: string }>(ACTIVE_FILE);
    if (!record?.id) {
      return null;
    }
    return this.get(record.id);
  }
}

export const spaceRepository: SpaceRepository = new JsonSpaceRepository();
