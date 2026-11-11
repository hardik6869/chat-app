import { describe, expect, it, vi } from 'vitest';
import { setErrorReporter } from '@/shared/lib';
import { bootstrapTestStore as ready } from '@/test';
import { selectThreadMessages } from './selectors';

describe('messages', () => {
  it('loads the latest page, then older pages', async () => {
    const { store } = await ready();

    await store.getState().loadMessages('c-engineering');
    expect(store.getState().threads['c-engineering']).toMatchObject({
      hasMore: true,
      status: 'success',
    });
    expect(store.getState().threads['c-engineering']?.ids).toHaveLength(50);

    await store.getState().loadOlderMessages('c-engineering');
    const messages = selectThreadMessages(store.getState(), 'c-engineering');
    expect(messages).toHaveLength(100);
    expect((messages[0]?.createdAt ?? '') < (messages[99]?.createdAt ?? '')).toBe(true);
  });

  it('sends optimistically, then confirms and notifies realtime', async () => {
    const { store, realtime } = await ready();
    await store.getState().loadMessages('c-ava');

    const sending = store.getState().sendMessage('c-ava', '  Hello  ');
    const optimistic = selectThreadMessages(store.getState(), 'c-ava').at(-1);
    expect(optimistic).toMatchObject({ text: 'Hello', status: 'sending' });

    await sending;
    expect(store.getState().messages[optimistic?.id ?? '']?.status).toBe('sent');
    expect(store.getState().conversations['c-ava']?.lastMessage?.text).toBe('Hello');
    expect(realtime.send).toHaveBeenCalledWith({
      type: 'message:sent',
      message: expect.objectContaining({ text: 'Hello' }) as unknown,
    });
  });

  it('ignores blank messages', async () => {
    const { store } = await ready();
    await store.getState().loadMessages('c-ava');
    const before = store.getState().threads['c-ava']?.ids.length;

    await store.getState().sendMessage('c-ava', '   ');

    expect(store.getState().threads['c-ava']?.ids).toHaveLength(before ?? 0);
  });

  it('marks failed sends and retries them', async () => {
    const restore = setErrorReporter(vi.fn());
    const { store, api } = await ready();
    const realSend = api.sendMessage;
    api.sendMessage = vi.fn().mockRejectedValueOnce(new Error('offline'));
    await store.getState().loadMessages('c-ava');

    await store.getState().sendMessage('c-ava', 'Hi');
    const failed = selectThreadMessages(store.getState(), 'c-ava').at(-1);
    expect(failed?.status).toBe('failed');

    api.sendMessage = realSend;
    await store.getState().retryMessage(failed?.id ?? '');
    expect(store.getState().messages[failed?.id ?? '']?.status).toBe('sent');
    restore();
  });

  it('edits, reacts and deletes own messages', async () => {
    const { store } = await ready();
    await store.getState().loadMessages('c-ava');
    const id = 'c-ava-m3';

    await store.getState().editMessage(id, 'Edited');
    expect(store.getState().messages[id]).toMatchObject({ text: 'Edited' });

    await store.getState().toggleReaction(id, '🎉');
    expect(store.getState().messages[id]?.reactions).toEqual([{ emoji: '🎉', userIds: ['me'] }]);

    await store.getState().deleteMessage(id);
    expect(store.getState().messages[id]).toMatchObject({ text: '', reactions: [] });
  });

  it('rolls back a rejected edit and rethrows', async () => {
    const { store } = await ready();
    await store.getState().loadMessages('c-ava');

    await expect(store.getState().editMessage('c-ava-m0', 'Not mine')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(store.getState().messages['c-ava-m0']?.text).toBe(
      'Morning! Did you get a chance to look at the onboarding flow?',
    );
  });
});
