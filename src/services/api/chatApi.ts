import { canEditMessage, isGroup, toggleReaction as applyReaction, type Message } from '@/entities';
import { mockConfig } from '../config';
import { createDatabase, type Database } from '../mock-server';
import { ApiError } from './errors';
import { validateText } from './validation';

const PAGE_SIZE = 50;
const SEARCH_LIMIT = 50;

interface ChatApiOptions {
  db?: Database;
  latencyMs?: number;
  failureRate?: number;
  random?: () => number;
  /** Requests fail like a real network call while this returns false. */
  isOnline?: () => boolean;
}

interface SendMessageInput {
  /** Client-generated id: makes optimistic updates and retries idempotent. */
  id: string;
  conversationId: string;
  text: string;
  replyToId?: string;
}

/** Async mock backend: latency, random failures, validation and cloned responses like a real API. */
export function createChatApi({
  db = createDatabase(),
  latencyMs = mockConfig.latencyMs,
  failureRate = mockConfig.failureRate,
  random = Math.random,
  isOnline = () => navigator.onLine,
}: ChatApiOptions = {}) {
  const me = db.currentUserId;

  /** Simulates the network, runs the handler and returns a copy. Writes trigger persistence. */
  async function request<T>(handler: () => T, { write = false } = {}): Promise<T> {
    if (latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs * (0.5 + random())));
    }
    if (!isOnline()) throw new ApiError('NETWORK', 'You are offline');
    if (random() < failureRate) throw new ApiError('NETWORK', 'Network request failed');
    const result = structuredClone(handler());
    if (write) db.touch();
    return result;
  }

  const write = <T>(handler: () => T) => request(handler, { write: true });

  function getConversation(conversationId: string) {
    const conversation = db.conversations.get(conversationId);
    if (!conversation) throw new ApiError('NOT_FOUND', 'Conversation not found');
    return conversation;
  }

  function getMessages(conversationId: string) {
    getConversation(conversationId);
    let messages = db.messages.get(conversationId);
    if (!messages) {
      messages = [];
      db.messages.set(conversationId, messages);
    }
    return messages;
  }

  /** Replaces a message, keeping `lastMessage` in sync. By default only the author may change it. */
  function updateMessage(
    conversationId: string,
    messageId: string,
    update: (message: Message) => Message,
    { ownOnly = true } = {},
  ) {
    const messages = getMessages(conversationId);
    const index = messages.findIndex((message) => message.id === messageId);
    const current = messages[index];
    if (!current) throw new ApiError('NOT_FOUND', 'Message not found');
    if (ownOnly && !canEditMessage(current, me)) {
      throw new ApiError('FORBIDDEN', 'You can only change your own messages');
    }
    const next = update(current);
    messages[index] = next;
    const conversation = getConversation(conversationId);
    if (conversation.lastMessage?.id === messageId) conversation.lastMessage = next;
    return next;
  }

  function getGroup(conversationId: string) {
    const conversation = getConversation(conversationId);
    if (!isGroup(conversation)) throw new ApiError('FORBIDDEN', 'Only groups have members');
    return conversation;
  }

  return {
    fetchBootstrap: () =>
      request(() => ({
        currentUserId: me,
        users: [...db.users.values()],
        conversations: [...db.conversations.values()],
      })),

    /** Newest page first call; pass `beforeId` (oldest loaded message) to load older pages. */
    fetchMessages: (conversationId: string, { beforeId }: { beforeId?: string } = {}) =>
      request(() => {
        const messages = getMessages(conversationId);
        const end = beforeId ? messages.findIndex((message) => message.id === beforeId) : -1;
        const stop = end === -1 ? messages.length : end;
        const start = Math.max(0, stop - PAGE_SIZE);
        return { messages: messages.slice(start, stop), hasMore: start > 0 };
      }),

    searchMessages: (conversationId: string, query: string) =>
      request(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return [];
        return getMessages(conversationId)
          .filter((m) => !m.deletedAt && m.text.toLowerCase().includes(needle))
          .slice(-SEARCH_LIMIT)
          .reverse();
      }),

    sendMessage: ({ id, conversationId, text, replyToId }: SendMessageInput) =>
      write(() => {
        const messages = getMessages(conversationId);
        const existing = messages.find((message) => message.id === id);
        if (existing) return existing;
        const message: Message = {
          id,
          conversationId,
          senderId: me,
          text: validateText(text),
          createdAt: new Date().toISOString(),
          status: 'sent',
          replyToId,
          reactions: [],
        };
        messages.push(message);
        getConversation(conversationId).lastMessage = message;
        return message;
      }),

    editMessage: (conversationId: string, messageId: string, text: string) =>
      write(() => {
        const nextText = validateText(text);
        return updateMessage(conversationId, messageId, (message) => ({
          ...message,
          text: nextText,
          editedAt: new Date().toISOString(),
        }));
      }),

    deleteMessage: (conversationId: string, messageId: string) =>
      write(() =>
        updateMessage(conversationId, messageId, (message) => ({
          ...message,
          text: '',
          reactions: [],
          deletedAt: new Date().toISOString(),
        })),
      ),

    toggleReaction: (conversationId: string, messageId: string, emoji: string) =>
      write(() =>
        updateMessage(
          conversationId,
          messageId,
          (message) => ({ ...message, reactions: applyReaction(message.reactions, emoji, me) }),
          { ownOnly: false },
        ),
      ),

    markAsRead: (conversationId: string) =>
      write(() => {
        getConversation(conversationId).unreadCount = 0;
      }),

    addMember: (conversationId: string, userId: string) =>
      write(() => {
        const group = getGroup(conversationId);
        if (!db.users.has(userId)) throw new ApiError('NOT_FOUND', 'User not found');
        if (!group.memberIds.includes(userId)) group.memberIds = [...group.memberIds, userId];
        return group;
      }),

    removeMember: (conversationId: string, userId: string) =>
      write(() => {
        const group = getGroup(conversationId);
        if (userId === me) throw new ApiError('VALIDATION', 'You cannot remove yourself');
        group.memberIds = group.memberIds.filter((id) => id !== userId);
        group.adminIds = group.adminIds.filter((id) => id !== userId);
        return group;
      }),
  };
}

export type ChatApi = ReturnType<typeof createChatApi>;
