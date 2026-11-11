import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_MESSAGE_LENGTH } from '@/entities';
import { createSeed } from '../mock-data';
import { createDatabase } from '../mock-server';
import { createChatApi, type ApiError } from './index';

const NOW = new Date(2026, 10, 11, 15, 30).getTime();

function setup(options: { failureRate?: number; latencyMs?: number } = {}) {
  const db = createDatabase(createSeed(NOW));
  const api = createChatApi({ db, latencyMs: 0, failureRate: 0, random: () => 0.5, ...options });
  return { db, api };
}

const expectApiError = (promise: Promise<unknown>, code: ApiError['code']) =>
  expect(promise).rejects.toMatchObject({ name: 'ApiError', code });

describe('chatApi', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('bootstraps the current user, users and conversations', async () => {
    const { api } = setup();
    const data = await api.fetchBootstrap();

    expect(data.currentUserId).toBe('me');
    expect(data.users.length).toBeGreaterThan(1);
    expect(data.conversations.length).toBeGreaterThan(1);
  });

  it('returns copies so callers cannot mutate server data', async () => {
    const { api, db } = setup();
    const { conversations } = await api.fetchBootstrap();
    const first = conversations[0];
    if (!first) throw new Error('Expected conversations');

    first.unreadCount = 999;

    expect(db.conversations.get(first.id)?.unreadCount).not.toBe(999);
  });

  it('pages messages newest first and loads older pages by cursor', async () => {
    const { api } = setup();
    const latest = await api.fetchMessages('c-engineering');
    const older = await api.fetchMessages('c-engineering', { beforeId: latest.messages[0]?.id });

    expect(latest.messages).toHaveLength(50);
    expect(latest.hasMore).toBe(true);
    expect((older.messages.at(-1)?.createdAt ?? '') < (latest.messages[0]?.createdAt ?? '')).toBe(
      true,
    );

    const small = await api.fetchMessages('c-priya');
    expect(small.hasMore).toBe(false);
  });

  it('sends a trimmed message idempotently and updates lastMessage', async () => {
    const { api, db } = setup();
    const input = {
      id: 'msg_1',
      conversationId: 'c-ava',
      text: '  Hi there  ',
      replyToId: 'c-ava-m0',
    };

    const sent = await api.sendMessage(input);
    await api.sendMessage(input);

    expect(sent).toMatchObject({
      text: 'Hi there',
      status: 'sent',
      senderId: 'me',
      replyToId: 'c-ava-m0',
    });
    expect(db.messages.get('c-ava')?.filter((m) => m.id === 'msg_1')).toHaveLength(1);
    expect(db.conversations.get('c-ava')?.lastMessage?.id).toBe('msg_1');
  });

  it('rejects empty, too long and unknown targets', async () => {
    const { api } = setup();
    const base = { id: 'x', conversationId: 'c-ava' };

    await expectApiError(api.sendMessage({ ...base, text: '   ' }), 'VALIDATION');
    await expectApiError(
      api.sendMessage({ ...base, text: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) }),
      'VALIDATION',
    );
    await expectApiError(
      api.sendMessage({ ...base, conversationId: 'nope', text: 'Hi' }),
      'NOT_FOUND',
    );
    await expectApiError(api.editMessage('c-ava', 'nope', 'Hi'), 'NOT_FOUND');
  });

  it('edits and deletes only own messages', async () => {
    const { api } = setup();

    const edited = await api.editMessage('c-ava', 'c-ava-m1', 'Updated');
    expect(edited.text).toBe('Updated');
    expect(edited.editedAt).toBeDefined();

    const deleted = await api.deleteMessage('c-ava', 'c-ava-m1');
    expect(deleted).toMatchObject({ text: '', reactions: [] });
    expect(deleted.deletedAt).toBeDefined();

    await expectApiError(api.editMessage('c-ava', 'c-ava-m0', 'Hack'), 'FORBIDDEN');
    await expectApiError(api.deleteMessage('c-ava', 'c-ava-m0'), 'FORBIDDEN');
  });

  it("toggles reactions on anyone's message", async () => {
    const { api } = setup();

    const added = await api.toggleReaction('c-ava', 'c-ava-m0', '👍');
    expect(added.reactions).toEqual([{ emoji: '👍', userIds: ['me'] }]);

    const removed = await api.toggleReaction('c-ava', 'c-ava-m0', '👍');
    expect(removed.reactions).toEqual([]);
  });

  it('searches non-deleted messages, newest first', async () => {
    const { api } = setup();

    const results = await api.searchMessages('c-design', 'TOKENS');
    expect(results.map((m) => m.id)).toEqual(['c-design-m0']);
    expect(await api.searchMessages('c-design', '  ')).toEqual([]);
  });

  it('marks conversations as read', async () => {
    const { api, db } = setup();

    await api.markAsRead('c-ava');

    expect(db.conversations.get('c-ava')?.unreadCount).toBe(0);
  });

  it('adds and removes group members, with guards', async () => {
    const { api } = setup();

    const added = await api.addMember('c-trip', 'ava');
    expect(added.memberIds).toContain('ava');
    expect(
      (await api.addMember('c-trip', 'ava')).memberIds.filter((id) => id === 'ava'),
    ).toHaveLength(1);

    const removed = await api.removeMember('c-trip', 'mia');
    expect(removed.memberIds).not.toContain('mia');
    expect(removed.adminIds).not.toContain('mia');

    await expectApiError(api.removeMember('c-trip', 'me'), 'VALIDATION');
    await expectApiError(api.addMember('c-trip', 'ghost'), 'NOT_FOUND');
    await expectApiError(api.addMember('c-ava', 'mia'), 'FORBIDDEN');
  });

  it('accepts a message that is only attachments', async () => {
    const { api } = setup();
    const attachments = [{ id: 'f1', name: 'a.png', type: 'image/png', size: 10, url: 'blob:a' }];

    const sent = await api.sendMessage({
      id: 'm-file',
      conversationId: 'c-ava',
      text: ' ',
      attachments,
    });

    expect(sent).toMatchObject({ text: '', attachments });
  });

  it('fails like a real request while the browser is offline', async () => {
    const db = createDatabase(createSeed(NOW));
    const api = createChatApi({ db, latencyMs: 0, failureRate: 0, isOnline: () => false });

    await expectApiError(api.fetchBootstrap(), 'NETWORK');
  });

  it('simulates latency and network failures', async () => {
    vi.useFakeTimers();
    const { api } = setup({ latencyMs: 400 });
    let settled = false;
    const pending = api.markAsRead('c-ava').then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(399);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(settled).toBe(true);

    vi.useRealTimers();
    const failing = setup({ failureRate: 1 });
    await expectApiError(failing.api.fetchBootstrap(), 'NETWORK');
  });
});
