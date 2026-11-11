import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setErrorReporter } from '@/shared/lib';
import { createChatApi } from '../api';
import { createPersistentDatabase } from './index';

const KEY = 'chat-app:db';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
}

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

  it('saves once, shortly after a burst of changes, and restores on the next load', async () => {
    const storage = memoryStorage();
    const { db } = createPersistentDatabase({ storage, saveDelayMs: 500 });
    const api = createChatApi({ db, latencyMs: 0 });

    const sendPromise = api.sendMessage({
      id: 'msg_saved',
      conversationId: 'c-ava',
      text: 'Saved',
    });
    await vi.advanceTimersByTimeAsync(0);
    await sendPromise;
    await api.markAsRead('c-ava');
    expect(storage.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(storage.setItem).toHaveBeenCalledOnce();

    const reloaded = createPersistentDatabase({ storage }).db;
    expect(reloaded.messages.get('c-ava')?.at(-1)?.text).toBe('Saved');
    expect(reloaded.conversations.get('c-ava')?.unreadCount).toBe(0);
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
    expect(storage.setItem).toHaveBeenCalledOnce();
  });

  it('re-seeds when the stored version is outdated', () => {
    const storage = memoryStorage({
      [KEY]: JSON.stringify({
        version: 0,
        currentUserId: 'me',
        users: [],
        conversations: [],
        messagesByConversation: {},
      }),
    });

    expect(createPersistentDatabase({ storage }).db.conversations.size).toBeGreaterThan(0);
  });

  it('re-seeds and reports when stored data is corrupted', () => {
    const reporter = vi.fn();
    const restore = setErrorReporter(reporter);

    const { db } = createPersistentDatabase({ storage: memoryStorage({ [KEY]: '{not json' }) });

    expect(db.conversations.size).toBeGreaterThan(0);
    expect(reporter).toHaveBeenCalledOnce();
    restore();
  });
});
