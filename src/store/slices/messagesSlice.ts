import { toggleReaction as applyReaction, type Message } from '@/entities';
import { captureError, createId } from '@/shared/lib';
import { appendMessage, replaceMessage } from '../helpers';
import type { MessagesSlice, SliceCreator, Thread } from '../types';

const emptyThread: Thread = { ids: [], hasMore: false, status: 'idle', olderStatus: 'idle' };

export const createMessagesSlice: SliceCreator<MessagesSlice> = (set, get, { api, realtime }) => {
  const setThread = (conversationId: string, patch: Partial<Thread>) => {
    set((state) => ({
      threads: {
        ...state.threads,
        [conversationId]: { ...(state.threads[conversationId] ?? emptyThread), ...patch },
      },
    }));
  };

  const storeMessages = (messages: Message[]) => {
    set((state) => ({
      messages: { ...state.messages, ...Object.fromEntries(messages.map((m) => [m.id, m])) },
    }));
  };

  async function deliver(message: Message) {
    try {
      const saved = await api.sendMessage(message);
      set((state) => replaceMessage(state, saved));
      realtime.send({ type: 'message:sent', message: saved });
    } catch (error) {
      captureError(error, 'sendMessage');
      set((state) => replaceMessage(state, { ...message, status: 'failed' }));
    }
  }

  /** Applies a change right away, and undoes it if the server rejects it. */
  async function optimistic(
    messageId: string,
    change: (message: Message) => Message,
    request: (message: Message) => Promise<Message>,
  ) {
    const previous = get().messages[messageId];
    if (!previous) return;
    set((state) => replaceMessage(state, change(previous)));
    try {
      const saved = await request(previous);
      set((state) => replaceMessage(state, saved));
    } catch (error) {
      const current = get().messages[messageId] ?? previous;
      set((state) =>
        replaceMessage(state, {
          ...current,
          text: previous.text,
          editedAt: previous.editedAt,
          deletedAt: previous.deletedAt,
          reactions: previous.reactions,
        }),
      );
      throw error;
    }
  }

  return {
    messages: {},
    threads: {},

    async loadMessages(conversationId) {
      const status = get().threads[conversationId]?.status;
      if (status === 'loading' || status === 'success') return;
      setThread(conversationId, { status: 'loading' });
      try {
        const page = await api.fetchMessages(conversationId);
        storeMessages(page.messages);
        setThread(conversationId, {
          ids: page.messages.map((message) => message.id),
          hasMore: page.hasMore,
          status: 'success',
        });
      } catch (error) {
        captureError(error, 'loadMessages');
        setThread(conversationId, { status: 'error' });
      }
    },

    async loadOlderMessages(conversationId) {
      const thread = get().threads[conversationId];
      if (thread?.status !== 'success' || !thread.hasMore || thread.olderStatus === 'loading') {
        return;
      }
      setThread(conversationId, { olderStatus: 'loading' });
      try {
        const page = await api.fetchMessages(conversationId, { beforeId: thread.ids[0] });
        storeMessages(page.messages);
        const ids = get().threads[conversationId]?.ids ?? [];
        const older = page.messages.map((message) => message.id).filter((id) => !ids.includes(id));
        setThread(conversationId, {
          ids: [...older, ...ids],
          hasMore: page.hasMore,
          olderStatus: 'success',
        });
      } catch (error) {
        captureError(error, 'loadOlderMessages');
        setThread(conversationId, { olderStatus: 'error' });
      }
    },

    async sendMessage(conversationId, text, replyToId) {
      const message: Message = {
        id: createId('msg'),
        conversationId,
        senderId: get().currentUserId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        status: 'sending',
        replyToId,
        reactions: [],
      };
      if (!message.text) return;
      set((state) => appendMessage(state, message));
      await deliver(message);
    },

    async retryMessage(messageId) {
      const message = get().messages[messageId];
      if (message?.status !== 'failed') return;
      const sending = { ...message, status: 'sending' as const };
      set((state) => replaceMessage(state, sending));
      await deliver(sending);
    },

    editMessage: (messageId, text) =>
      optimistic(
        messageId,
        (message) => ({ ...message, text: text.trim(), editedAt: new Date().toISOString() }),
        (message) => api.editMessage(message.conversationId, messageId, text),
      ),

    deleteMessage: (messageId) =>
      optimistic(
        messageId,
        (message) => ({ ...message, text: '', reactions: [], deletedAt: new Date().toISOString() }),
        (message) => api.deleteMessage(message.conversationId, messageId),
      ),

    searchMessages: (conversationId, query) => api.searchMessages(conversationId, query),

    toggleReaction: (messageId, emoji) =>
      optimistic(
        messageId,
        (message) => ({
          ...message,
          reactions: applyReaction(message.reactions, emoji, get().currentUserId),
        }),
        (message) => api.toggleReaction(message.conversationId, messageId, emoji),
      ),
  };
};
