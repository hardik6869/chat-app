import type { Conversation, Message, User } from '@/entities';
import { captureError, safeStorage } from '@/shared/lib';
import { createSeed } from '../mock-data';
import { createDatabase, type Database } from './database';

/** Bump when the stored shape changes; older data is discarded and re-seeded. */
const SCHEMA_VERSION = 2;
const META_KEY = 'chat-app:db:v2';
const messagesKey = (conversationId: string) => `${META_KEY}:messages:${conversationId}`;
/** v1 stored everything in one large entry. */
const LEGACY_KEY = 'chat-app:db';

type Storage = Pick<typeof safeStorage, 'getItem' | 'setItem' | 'removeItem'>;

/** Small record saved on every change. Messages live in one entry per conversation. */
interface Meta {
  version: number;
  /** The seed is deterministic for a given time, so untouched chats are regenerated, not stored. */
  seedNow: number;
  currentUserId: string;
  users: User[];
  conversations: Conversation[];
}

function readJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    captureError(error, `mock-server.read(${key})`);
    return undefined;
  }
}

function isMeta(value: unknown): value is Meta {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Meta>;
  return (
    candidate.version === SCHEMA_VERSION &&
    typeof candidate.seedNow === 'number' &&
    typeof candidate.currentUserId === 'string' &&
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.conversations)
  );
}

/** Restores saved data; chats without saved messages come back from the deterministic seed. */
function load(storage: Storage) {
  const meta = readJson(storage, META_KEY);
  if (!isMeta(meta)) return undefined;
  const seed = createSeed(meta.seedNow);
  const messagesByConversation = Object.fromEntries(
    meta.conversations.map(({ id }) => {
      const saved = readJson(storage, messagesKey(id));
      const messages = Array.isArray(saved)
        ? (saved as Message[])
        : (seed.messagesByConversation[id] ?? []);
      return [id, messages];
    }),
  );
  return {
    seedNow: meta.seedNow,
    seed: { ...meta, messagesByConversation },
  };
}

interface PersistenceOptions {
  storage?: Storage;
  saveDelayMs?: number;
}

/**
 * Database restored from localStorage (or freshly seeded), saved shortly after changes.
 * Only what changed is written: the small meta record, plus the messages of conversations
 * that changed — never the whole 10,000-message history at once.
 */
export function createPersistentDatabase({
  storage = safeStorage,
  saveDelayMs = 500,
}: PersistenceOptions = {}) {
  storage.removeItem(LEGACY_KEY);
  const restored = load(storage);
  const seedNow = restored?.seedNow ?? Date.now();
  const dirtyConversations = new Set<string>();
  let timer: number | undefined;

  const save = () => {
    timer = undefined;
    const meta: Meta = {
      version: SCHEMA_VERSION,
      seedNow,
      currentUserId: db.currentUserId,
      users: [...db.users.values()],
      conversations: [...db.conversations.values()],
    };
    storage.setItem(META_KEY, JSON.stringify(meta));
    dirtyConversations.forEach((conversationId) => {
      storage.setItem(
        messagesKey(conversationId),
        JSON.stringify(db.messages.get(conversationId) ?? []),
      );
    });
    dirtyConversations.clear();
  };

  const db: Database = createDatabase(restored?.seed ?? createSeed(seedNow), (conversationId) => {
    if (conversationId) dirtyConversations.add(conversationId);
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
