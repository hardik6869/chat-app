import { describe, expect, it } from 'vitest';
import { bootstrapTestStore as ready } from '@/test';
import { connectRealtime } from './createChatStore';
import { selectThreadMessages, selectTypingNames } from './selectors';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('realtime', () => {
  it('appends incoming messages and counts unread for inactive chats', async () => {
    const { store, emit } = await ready();
    await store.getState().loadMessages('c-ava');
    const incoming = {
      id: 'in1',
      conversationId: 'c-ava',
      senderId: 'ava',
      text: 'Ping',
      createdAt: new Date().toISOString(),
      status: 'sent' as const,
      reactions: [],
    };

    emit({ type: 'typing', conversationId: 'c-ava', userId: 'ava', isTyping: true });
    expect(selectTypingNames(store.getState(), 'c-ava')).toEqual(['Ava Patel']);

    emit({ type: 'message:new', message: incoming });
    const state = store.getState();
    expect(selectThreadMessages(state, 'c-ava').at(-1)?.id).toBe('in1');
    expect(state.conversations['c-ava']?.unreadCount).toBe(3);
    expect(selectTypingNames(state, 'c-ava')).toEqual([]);

    emit({ type: 'message:new', message: incoming });
    expect(store.getState().threads['c-ava']?.ids.filter((id) => id === 'in1')).toHaveLength(1);
  });

  it('keeps the active chat read', async () => {
    const { store, emit } = await ready();
    store.getState().setActiveConversation('c-liam');
    await flush();

    emit({
      type: 'message:new',
      message: {
        id: 'in2',
        conversationId: 'c-liam',
        senderId: 'liam',
        text: 'Hey',
        createdAt: new Date().toISOString(),
        status: 'sent',
        reactions: [],
      },
    });

    expect(store.getState().conversations['c-liam']?.unreadCount).toBe(0);
  });

  it('applies receipts forward only, and presence', async () => {
    const { store, emit } = await ready();
    await store.getState().loadMessages('c-liam');
    const id = 'c-liam-m3';

    emit({ type: 'message:status', conversationId: 'c-liam', messageId: id, status: 'read' });
    emit({ type: 'message:status', conversationId: 'c-liam', messageId: id, status: 'delivered' });
    expect(store.getState().messages[id]?.status).toBe('read');
    expect(store.getState().conversations['c-liam']?.lastMessage?.status).toBe('read');

    emit({ type: 'presence', userId: 'liam', isOnline: true });
    expect(store.getState().users.liam?.isOnline).toBe(true);
  });

  it('connects and cleans up the realtime client', async () => {
    const { store, realtime } = await ready();

    const disconnect = connectRealtime(store, realtime);
    expect(realtime.connect).toHaveBeenCalledOnce();

    disconnect();
    expect(realtime.disconnect).toHaveBeenCalledOnce();
  });
});
