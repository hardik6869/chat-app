import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { MessageList } from './MessageList';

const loaded = async (conversationId: string) => {
  await act(() => useChatStore.getState().loadMessages(conversationId));
  return render(<MessageList conversationId={conversationId} />);
};

describe('MessageList', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  // jsdom has no layout: give the scroll area (client size) and rows (offset size) real sizes
  // so the virtualizer can work out which rows are visible.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(60);
  });

  it('renders messages with date separators, time and "edited"', async () => {
    await loaded('c-ava');
    const list = screen.getByRole('list');

    expect(within(list).getByText('Yesterday')).toBeInTheDocument();
    expect(within(list).getByText('Today')).toBeInTheDocument();
    expect(within(list).getByText("I'll bring the updated illustrations.")).toBeInTheDocument();
    expect(list.querySelectorAll('time').length).toBeGreaterThan(3);
  });

  it('shows sender name and avatar only on the first message of a group run', async () => {
    await loaded('c-design');

    expect(screen.getAllByText('Sofia Garcia').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('img', { name: 'Sofia Garcia' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('img', { name: 'Jordan Lee' })).toBeNull();
  });

  it('marks deleted and edited messages', async () => {
    const { messages } = useChatStore.getState();
    const edited = messages['c-ava-m1'];
    const deleted = messages['c-ava-m3'];
    if (!edited || !deleted) throw new Error('Expected seeded messages');
    useChatStore.setState({
      messages: {
        ...messages,
        [edited.id]: { ...edited, editedAt: new Date().toISOString() },
        [deleted.id]: { ...deleted, text: '', deletedAt: new Date().toISOString() },
      },
    });
    await loaded('c-ava');

    expect(screen.getByText('edited')).toBeInTheDocument();
    expect(screen.getByText('This message was deleted')).toBeInTheDocument();
  });

  it('keeps only a window of rows in the DOM for very long chats', async () => {
    await loaded('c-engineering');
    const items = screen.getAllByRole('listitem');

    expect(items.length).toBeLessThan(40);
    expect(items[0]).toHaveAttribute('aria-setsize');
  });

  it('shows loading, empty and error states', async () => {
    useChatStore.setState((state) => ({
      threads: {
        ...state.threads,
        'c-x': { ids: [], hasMore: false, status: 'loading', olderStatus: 'idle' },
      },
    }));
    const { rerender } = render(<MessageList conversationId="c-x" />);
    expect(screen.getByRole('status', { name: 'Loading messages' })).toBeInTheDocument();

    act(() => {
      useChatStore.setState((state) => ({
        threads: {
          ...state.threads,
          'c-x': { ids: [], hasMore: false, status: 'success', olderStatus: 'idle' },
        },
      }));
    });
    rerender(<MessageList conversationId="c-x" />);
    expect(screen.getByText('No messages yet')).toBeInTheDocument();

    act(() => {
      useChatStore.setState((state) => ({
        threads: {
          ...state.threads,
          'c-x': { ids: [], hasMore: false, status: 'error', olderStatus: 'idle' },
        },
      }));
    });
    rerender(<MessageList conversationId="c-x" />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load messages");
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  });

  it('has no accessibility violations', async () => {
    const { container } = await loaded('c-design');

    await expectNoA11yViolations(container);
  });
});
