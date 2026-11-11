import { captureError, safeStorage } from '@/shared/lib';
import { createSeed, type Seed } from '../mock-data';
import { createDatabase, type Database } from './database';

const STORAGE_KEY = 'chat-app:db';
/** Bump when the stored shape changes; older snapshots are discarded and re-seeded. */
const SCHEMA_VERSION = 1;

type Storage = Pick<typeof safeStorage, 'getItem' | 'setItem'>;

interface Snapshot extends Seed {
  version: number;
}

function isSnapshot(value: unknown): value is Snapshot {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Snapshot>;
  return (
    candidate.version === SCHEMA_VERSION &&
    typeof candidate.currentUserId === 'string' &&
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.conversations) &&
    typeof candidate.messagesByConversation === 'object'
  );
}

function loadSnapshot(storage: Storage): Seed | undefined {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSnapshot(parsed) ? parsed : undefined;
  } catch (error) {
    captureError(error, 'mock-server.loadSnapshot');
    return undefined;
  }
}

function toSnapshot(db: Database): Snapshot {
  return {
    version: SCHEMA_VERSION,
    currentUserId: db.currentUserId,
    users: [...db.users.values()],
    conversations: [...db.conversations.values()],
    messagesByConversation: Object.fromEntries(db.messages),
  };
}

interface PersistenceOptions {
  storage?: Storage;
  saveDelayMs?: number;
}

/**
 * Database restored from localStorage (or freshly seeded), saved shortly after each change.
 * `flush()` writes pending changes immediately, e.g. when the page is closing.
 */
export function createPersistentDatabase({
  storage = safeStorage,
  saveDelayMs = 500,
}: PersistenceOptions = {}) {
  let timer: number | undefined;

  const save = () => {
    timer = undefined;
    storage.setItem(STORAGE_KEY, JSON.stringify(toSnapshot(db)));
  };

  const db: Database = createDatabase(loadSnapshot(storage) ?? createSeed(), () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(save, saveDelayMs);
  });

  return {
    db,
    flush() {
      if (timer === undefined) return;
      window.clearTimeout(timer);
      save();
    },
  };
}
