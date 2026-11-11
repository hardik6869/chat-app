import { describe, expect, it } from 'vitest';
import {
  canEditMessage,
  presenceText,
  getConversationTitle,
  getPartnerId,
  isGroup,
  toggleReaction,
  type DirectConversation,
  type GroupConversation,
  type Message,
  type Reaction,
  type UsersById,
} from '@/entities';

const ME = 'me';

const users: UsersById = {
  me: { id: 'me', name: 'You', isOnline: true },
  ava: { id: 'ava', name: 'Ava Patel', isOnline: false },
};

const direct: DirectConversation = {
  id: 'c1',
  type: 'direct',
  memberIds: [ME, 'ava'],
  unreadCount: 0,
  createdAt: '2026-11-01T09:00:00.000Z',
};

const group: GroupConversation = {
  ...direct,
  id: 'c2',
  type: 'group',
  name: 'Design Team',
  adminIds: [ME],
};

const message: Message = {
  id: 'm1',
  conversationId: 'c1',
  senderId: ME,
  text: 'Hello',
  createdAt: '2026-11-11T09:41:00.000Z',
  status: 'read',
  reactions: [],
};

describe('conversation helpers', () => {
  it('narrows groups', () => {
    expect(isGroup(group)).toBe(true);
    expect(isGroup(direct)).toBe(false);
  });

  it('finds the other person in a direct chat', () => {
    expect(getPartnerId(direct, ME)).toBe('ava');
    expect(getPartnerId({ ...direct, memberIds: [ME] }, ME)).toBe(ME);
  });

  it('titles groups by name and direct chats by partner', () => {
    expect(getConversationTitle(group, users, ME)).toBe('Design Team');
    expect(getConversationTitle(direct, users, ME)).toBe('Ava Patel');
    expect(getConversationTitle({ ...direct, memberIds: [ME, 'ghost'] }, users, ME)).toBe(
      'Unknown user',
    );
  });
});

describe('presenceText', () => {
  it('describes online, last seen and unknown users', () => {
    expect(presenceText({ id: 'a', name: 'A', isOnline: true })).toBe('Online');
    expect(
      presenceText({ id: 'b', name: 'B', isOnline: false, lastSeenAt: new Date().toISOString() }),
    ).toMatch(/^Last seen \d/);
    expect(presenceText({ id: 'c', name: 'C', isOnline: false })).toBe('Offline');
    expect(presenceText(undefined)).toBe('Offline');
  });
});

describe('canEditMessage', () => {
  it.each([
    ['own sent message', message, true],
    ["someone else's message", { ...message, senderId: 'ava' }, false],
    ['deleted message', { ...message, deletedAt: '2026-11-11T10:00:00.000Z' }, false],
    ['failed message', { ...message, status: 'failed' as const }, false],
  ])('%s → %s', (_case, value, expected) => {
    expect(canEditMessage(value, ME)).toBe(expected);
  });
});

describe('toggleReaction', () => {
  const reactions: Reaction[] = [{ emoji: '👍', userIds: ['ava'] }];

  it('adds a new emoji', () => {
    expect(toggleReaction(reactions, '❤️', ME)).toEqual([
      { emoji: '👍', userIds: ['ava'] },
      { emoji: '❤️', userIds: [ME] },
    ]);
  });

  it('joins an existing emoji', () => {
    expect(toggleReaction(reactions, '👍', ME)).toEqual([{ emoji: '👍', userIds: ['ava', ME] }]);
  });

  it('removes the user, and the emoji once nobody is left', () => {
    const joined = toggleReaction(reactions, '👍', ME);

    expect(toggleReaction(joined, '👍', ME)).toEqual(reactions);
    expect(toggleReaction(reactions, '👍', 'ava')).toEqual([]);
  });

  it('does not mutate the input', () => {
    const frozen = Object.freeze([Object.freeze({ emoji: '👍', userIds: ['ava'] })]);

    expect(() => toggleReaction(frozen as Reaction[], '👍', ME)).not.toThrow();
  });
});
