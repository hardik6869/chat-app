import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { useChatStore } from '@/store';
import { useUnreadTitle } from './useUnreadTitle';

describe('useUnreadTitle', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  it('shows the total unread count and resets on unmount', () => {
    const { unmount } = renderHook(() => {
      useUnreadTitle();
    });
    expect(document.title).toBe('(6) Chat App');

    act(() => {
      useChatStore.setState((state) => ({
        conversations: Object.fromEntries(
          Object.entries(state.conversations).map(([id, item]) => [
            id,
            { ...item, unreadCount: 0 },
          ]),
        ),
      }));
    });
    expect(document.title).toBe('Chat App');

    unmount();
    expect(document.title).toBe('Chat App');
  });
});
