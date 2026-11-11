import { captureError } from '@/shared/lib';
import type { SessionSlice, SliceCreator } from '../types';

const byId = <T extends { id: string }>(items: readonly T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]));

export const createSessionSlice: SliceCreator<SessionSlice> = (set, get, { api }) => ({
  currentUserId: '',
  users: {},
  conversations: {},
  bootstrapStatus: 'idle',
  activeConversationId: undefined,

  async bootstrap() {
    if (get().bootstrapStatus === 'loading') return;
    set({ bootstrapStatus: 'loading' });
    try {
      const { currentUserId, users, conversations } = await api.fetchBootstrap();
      set({
        currentUserId,
        users: byId(users),
        conversations: byId(conversations),
        bootstrapStatus: 'success',
      });
    } catch (error) {
      captureError(error, 'bootstrap');
      set({ bootstrapStatus: 'error' });
    }
  },

  setActiveConversation(conversationId) {
    set({ activeConversationId: conversationId });
    if (!conversationId) return;
    void get().loadMessages(conversationId);
    if (get().conversations[conversationId]?.unreadCount) void get().markAsRead(conversationId);
  },

  async markAsRead(conversationId) {
    set((state) => {
      const conversation = state.conversations[conversationId];
      return conversation
        ? {
            conversations: {
              ...state.conversations,
              [conversationId]: { ...conversation, unreadCount: 0 },
            },
          }
        : {};
    });
    try {
      await api.markAsRead(conversationId);
    } catch (error) {
      captureError(error, 'markAsRead');
    }
  },

  async addMember(conversationId, userId) {
    const group = await api.addMember(conversationId, userId);
    set((state) => ({ conversations: { ...state.conversations, [group.id]: group } }));
  },

  async removeMember(conversationId, userId) {
    const group = await api.removeMember(conversationId, userId);
    set((state) => ({ conversations: { ...state.conversations, [group.id]: group } }));
  },
});
