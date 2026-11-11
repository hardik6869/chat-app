import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setErrorReporter } from '@/shared/lib';
import { createChatApi } from '../api';
import { createPersistentDatabase } from './index';

const META_KEY = 'chat-app:db:v2';
const messagesKey = (id: string) => `${META_KEY}:messages:${id}`;

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key);
    }),
  };
}

const writtenKeys = (storage: ReturnType<typeof memoryStorage>) =>
  storage.setItem.mock.calls.map(([key]) => key);

describe('createPersistentDatabase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('seeds a fresh database when nothing is stored', () => {
    const { db } = createPersistentDatabase({ storage: memoryStorage() });

    expect(db.conversations.size).toBeGreaterThan(0);
    expect(db.messages.get('c-engineering')).toHaveLength(10_000);
  });

  it('saves only the small meta record for changes like read state', async () => {
    const storage = memoryStorage();
    const { db } = createPersistentDatabase({ storage, saveDelayMs: 500 });

    await createChatApi({ db, latencyMs: 0 }).markAsRead('c-ava');
    vi.advanceTimersByTime(500);

    expect(writtenKeys(storage)).toEqual([META_KEY]);
  });

  it('saves the changed conversation only, once per burst, and restores it later', async () => {
    const storage = memoryStorage();
    const { db } = createPersistentDatabase({ storage, saveDelayMs: 500 });
    const api = createChatApi({ db, latencyMs: 0 });

    await api.sendMessage({ id: 'msg_saved', conversationId: 'c-ava', text: 'Saved' });
    await api.markAsRead('c-ava');
    expect(storage.setItem).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);

    expect(writtenKeys(storage).sort()).toEqual([META_KEY, messagesKey('c-ava')].sort());

    const reloaded = createPersistentDatabase({ storage }).db;
    expect(reloaded.messages.get('c-ava')?.at(-1)?.text).toBe('Saved');
    expect(reloaded.conversations.get('c-ava')?.unreadCount).toBe(0);
    // Untouched chats come back from the deterministic seed, identical to before.
    expect(reloaded.messages.get('c-engineering')).toEqual(db.messages.get('c-engineering'));
  });

  it('does not save after read-only requests', async () => {
    const storage = memoryStorage();
    const { db } = createPersistentDatabase({ storage });
    const api = createChatApi({ db, latencyMs: 0 });

    await api.fetchBootstrap();
    await api.fetchMessages('c-ava');
    vi.advanceTimersByTime(1000);

    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('flushes pending changes immediately', () => {
    const storage = memoryStorage();
    const persistence = createPersistentDatabase({ storage });

    persistence.flush();
    expect(storage.setItem).not.toHaveBeenCalled();

    persistence.db.touch();
    persistence.flush();
    expect(writtenKeys(storage)).toEqual([META_KEY]);
  });

  it('removes data saved in the old single-entry format', () => {
    const storage = memoryStorage({ 'chat-app:db': '{"version":1}' });

    createPersistentDatabase({ storage });

    expect(storage.data.has('chat-app:db')).toBe(false);
  });

  it('re-seeds when the stored version is outdated', () => {
    const storage = memoryStorage({
      [META_KEY]: JSON.stringify({
        version: 1,
        seedNow: 0,
        currentUserId: 'me',
        users: [],
        conversations: [],
      }),
    });

    expect(createPersistentDatabase({ storage }).db.conversations.size).toBeGreaterThan(0);
  });

  it('re-seeds and reports when stored data is corrupted', () => {
    const reporter = vi.fn();
    const restore = setErrorReporter(reporter);

    const { db } = createPersistentDatabase({
      storage: memoryStorage({ [META_KEY]: '{not json' }),
    });

    expect(db.conversations.size).toBeGreaterThan(0);
    expect(reporter).toHaveBeenCalledOnce();
    restore();
  });
});
