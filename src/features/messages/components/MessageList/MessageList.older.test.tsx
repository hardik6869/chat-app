import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/store';
import { mockLayout } from '@/test';
import { MessageList } from './MessageList';

const LONG_CHAT = 'c-engineering';
const scrollTo = vi.fn();

function scrollToTop(offset: number) {
  const region = screen.getByRole('region', { name: 'Messages' });
  Object.defineProperty(region, 'scrollTop', { configurable: true, value: offset });
  fireEvent.scroll(region);
}

const threadSize = () => useChatStore.getState().threads[LONG_CHAT]?.ids.length;

describe('Loading older messages', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(async () => {
    mockLayout();
    HTMLElement.prototype.scrollTo = scrollTo;
    scrollTo.mockClear();
    // Start each test from a fresh, unloaded thread.
    useChatStore.setState((state) => ({
      threads: Object.fromEntries(Object.entries(state.threads).filter(([id]) => id !== LONG_CHAT)),
    }));
    await act(() => useChatStore.getState().loadMessages(LONG_CHAT));
  });

  it('loads the previous page near the top and keeps the reader in place', async () => {
    render(<MessageList conversationId={LONG_CHAT} />);
    expect(threadSize()).toBe(50);
    scrollTo.mockClear();

    scrollToTop(40);

    await waitFor(() => {
      expect(threadSize()).toBe(100);
    });
    expect(scrollTo).toHaveBeenCalled();
    expect(screen.queryByText('Start of the conversation')).toBeNull();
  });

  it('does not load while reading further down', () => {
    render(<MessageList conversationId={LONG_CHAT} />);

    scrollToTop(2000);

    expect(threadSize()).toBe(50);
  });

  it('marks the start once everything is loaded', async () => {
    await act(() => useChatStore.getState().loadMessages('c-sofia'));
    render(<MessageList conversationId="c-sofia" />);

    expect(screen.getByText('Start of the conversation')).toBeInTheDocument();
  });

  it('shows progress and a retry when an older page fails', async () => {
    const loadOlderMessages = vi.fn(() => Promise.resolve());
    const setOlderStatus = (olderStatus: 'loading' | 'error') => {
      act(() => {
        useChatStore.setState((state) => {
          const thread = state.threads[LONG_CHAT];
          return thread
            ? {
                loadOlderMessages,
                threads: { ...state.threads, [LONG_CHAT]: { ...thread, olderStatus } },
              }
            : {};
        });
      });
    };
    render(<MessageList conversationId={LONG_CHAT} />);

    setOlderStatus('loading');
    expect(screen.getByText('Loading older messages…')).toBeInTheDocument();

    setOlderStatus('error');
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load older messages.");
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(loadOlderMessages).toHaveBeenCalledWith(LONG_CHAT);
  });
});
