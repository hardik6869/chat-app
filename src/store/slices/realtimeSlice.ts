import type { MessageStatus } from '@/entities';
import { appendMessage, replaceMessage } from '../helpers';
import type { RealtimeSlice, SliceCreator } from '../types';

const STATUS_RANK: Record<MessageStatus, number> = {
  failed: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

function updateTyping(
  typing: Record<string, string[]>,
  conversationId: string,
  userId: string,
  isTyping: boolean,
) {
  const current = typing[conversationId] ?? [];
  const next = isTyping
    ? [...new Set([...current, userId])]
    : current.filter((id) => id !== userId);
  return { ...typing, [conversationId]: next };
}

/** Applies server events to the store. Receipts never move a message backwards. */
export const createRealtimeSlice: SliceCreator<RealtimeSlice> = (set, get) => ({
  typing: {},

  handleRealtimeEvent(event) {
    switch (event.type) {
      case 'message:new': {
        const { message } = event;
        const isActive = get().activeConversationId === message.conversationId;
        set((state) => ({
          ...appendMessage(state, message, isActive ? 0 : 1),
          typing: updateTyping(state.typing, message.conversationId, message.senderId, false),
        }));
        if (isActive) void get().markAsRead(message.conversationId);
        break;
      }
      case 'message:status': {
        const message = get().messages[event.messageId];
        if (!message || STATUS_RANK[event.status] <= STATUS_RANK[message.status]) break;
        set((state) => replaceMessage(state, { ...message, status: event.status }));
        break;
      }
      case 'typing':
        set((state) => ({
          typing: updateTyping(state.typing, event.conversationId, event.userId, event.isTyping),
        }));
        break;
      case 'presence': {
        const user = get().users[event.userId];
        if (!user) break;
        set((state) => ({
          users: {
            ...state.users,
            [user.id]: { ...user, isOnline: event.isOnline, lastSeenAt: event.lastSeenAt },
          },
        }));
        break;
      }
    }
  },
});
