import { describe, expect, it } from 'vitest';
import { isGroup, type Message } from '@/entities';
import { createSeed, LARGE_CONVERSATION_ID } from './index';

const NOW = new Date(2026, 10, 11, 15, 30).getTime();
const seed = createSeed(NOW);
const allMessages = Object.values(seed.messagesByConversation).flat();
const userIds = new Set(seed.users.map((user) => user.id));

const isSortedOldestFirst = (messages: Message[]) =>
  messages.every(
    (message, i) => i === 0 || (messages[i - 1]?.createdAt ?? '') <= message.createdAt,
  );

describe('createSeed', () => {
  it('is deterministic for the same "now"', () => {
    expect(createSeed(NOW)).toEqual(seed);
  });

  it('includes the current user and only known members', () => {
    expect(userIds.has(seed.currentUserId)).toBe(true);
    for (const conversation of seed.conversations) {
      expect(conversation.memberIds).toContain(seed.currentUserId);
      conversation.memberIds.forEach((id) => {
        expect(userIds.has(id)).toBe(true);
      });
    }
  });

  it('has unique ids and messages only from conversation members', () => {
    expect(new Set(allMessages.map((message) => message.id)).size).toBe(allMessages.length);
    for (const conversation of seed.conversations) {
      for (const message of seed.messagesByConversation[conversation.id] ?? []) {
        expect(conversation.memberIds).toContain(message.senderId);
        expect(message.conversationId).toBe(conversation.id);
      }
    }
  });

  it('keeps messages oldest first, in the past, and lastMessage in sync', () => {
    for (const conversation of seed.conversations) {
      const messages = seed.messagesByConversation[conversation.id] ?? [];
      expect(isSortedOldestFirst(messages)).toBe(true);
      expect(conversation.lastMessage).toEqual(messages.at(-1));
      expect(Date.parse(messages.at(-1)?.createdAt ?? '')).toBeLessThan(NOW);
    }
  });

  it('only replies to existing earlier messages', () => {
    const byId = new Map(allMessages.map((message) => [message.id, message]));
    for (const message of allMessages.filter((item) => item.replyToId)) {
      const original = byId.get(message.replyToId ?? '');
      expect(original?.conversationId).toBe(message.conversationId);
      expect(original && original.createdAt < message.createdAt).toBe(true);
    }
  });

  it('marks unread only messages received from others', () => {
    for (const conversation of seed.conversations) {
      const messages = seed.messagesByConversation[conversation.id] ?? [];
      const trailing = messages.slice(messages.length - conversation.unreadCount);
      trailing.forEach((message) => {
        expect(message.senderId).not.toBe(seed.currentUserId);
      });
    }
  });

  it('includes direct chats, groups and a 10,000-message chat', () => {
    expect(seed.conversations.some(isGroup)).toBe(true);
    expect(seed.conversations.some((conversation) => !isGroup(conversation))).toBe(true);
    expect(seed.messagesByConversation[LARGE_CONVERSATION_ID]).toHaveLength(10_000);
  });

  it('turns "last seen" into timestamps for offline users only', () => {
    for (const user of seed.users) {
      expect(user.lastSeenAt === undefined).toBe(user.isOnline);
    }
  });
});
