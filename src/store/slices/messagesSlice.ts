import { toggleReaction as applyReaction, type Message } from '@/entities';
import { captureError, createId } from '@/shared/lib';
import { appendMessage, replaceMessage, resolveUnreadMarker } from '../helpers';
import type { MessagesSlice, SliceCreator, Thread } from '../types';

/** Read live each time: the connection can drop while a request is in flight. */
const isOffline = () => !navigator.onLine;

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

  const queue = (messageId: string) => {
    set((state) => ({
      outbox: state.outbox.includes(messageId) ? state.outbox : [...state.outbox, messageId],
    }));
  };

  /** Sends a message; while offline it waits in the outbox (still "sending") instead of failing. */
  async function deliver(message: Message) {
    if (isOffline()) {
      queue(message.id);
      return;
    }
    try {
      const saved = await api.sendMessage(message);
      set((state) => replaceMessage(state, saved));
      realtime.send({ type: 'message:sent', message: saved });
    } catch (error) {
      if (isOffline()) {
        queue(message.id);
        return;
      }
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
    outbox: [],

    async flushOutbox() {
      const queued = get().outbox;
      set({ outbox: [] });
      for (const messageId of queued) {
        const message = get().messages[messageId];
        if (message?.status === 'sending') await deliver(message);
      }
    },

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
        // The chat was opened before its messages arrived: pin the unread divider now.
        const marker = get().unreadMarkers[conversationId];
        if (marker && !marker.messageId) {
          set((state) => ({
            unreadMarkers: {
              ...state.unreadMarkers,
              [conversationId]: resolveUnreadMarker(state, conversationId, marker.count),
            },
          }));
        }
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
