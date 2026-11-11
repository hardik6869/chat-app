import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useChatStore } from '@/store';
import { mockLayout, renderChat } from '@/test';
import { ChatWindow } from './ChatWindow';

const incoming = (id: string, senderId: string, conversationId: string) => ({
  id,
  conversationId,
  senderId,
  text: `Hello from ${senderId}`,
  createdAt: new Date().toISOString(),
  status: 'sent' as const,
  reactions: [],
});

describe('Unread divider', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
  });

  it('marks where unread messages start, even after they are marked read', async () => {
    expect(useChatStore.getState().conversations['c-design']?.unreadCount).toBe(3);

    renderChat('c-design');

    const divider = await screen.findByText('3 unread messages');
    const next = divider.closest('[role="listitem"]')?.nextElementSibling;
    expect(next).toHaveTextContent('Running 5 min late, start without me!');
    await waitFor(() => {
      expect(useChatStore.getState().conversations['c-design']?.unreadCount).toBe(0);
    });
    expect(screen.getByText('3 unread messages')).toBeInTheDocument();

    // New messages arrive while reading: the divider stays above the same message.
    act(() => {
      useChatStore.getState().handleRealtimeEvent({
        type: 'message:new',
        message: {
          id: 'late',
          conversationId: 'c-design',
          senderId: 'ava',
          text: 'One more thing',
          createdAt: new Date().toISOString(),
          status: 'sent',
          reactions: [],
        },
      });
    });
    expect(
      screen.getByText('3 unread messages').closest('[role="listitem"]')?.nextElementSibling,
    ).toHaveTextContent('Running 5 min late, start without me!');
  });

  it('keeps the divider under StrictMode, where effects run twice', async () => {
    expect(useChatStore.getState().conversations['c-priya']?.unreadCount).toBe(1);

    render(
      <MemoryRouter>
        <ChatWindow conversationId="c-priya" />
      </MemoryRouter>,
      { reactStrictMode: true },
    );

    expect(await screen.findByText('1 unread message')).toBeInTheDocument();
  });

  it('shows no divider when everything was already read', async () => {
    renderChat('c-liam');

    await screen.findByText('Ping me if you need a review.');
    expect(screen.queryByText(/unread message/)).toBeNull();
  });
});

describe('New message announcements', () => {
  beforeEach(() => {
    mockLayout();
  });

  it("announces other people's new messages in the open chat, not mine", async () => {
    await useChatStore.getState().bootstrap();
    const { container } = renderChat('c-ava');
    const live = () => container.querySelector('p.sr-only[aria-live="polite"]');
    const emit = (message: ReturnType<typeof incoming>) => {
      act(() => {
        useChatStore.getState().handleRealtimeEvent({ type: 'message:new', message });
      });
    };

    emit(incoming('n1', 'ava', 'c-ava'));
    expect(live()).toHaveTextContent('New message from Ava Patel: Hello from ava');

    emit(incoming('n2', 'me', 'c-ava'));
    expect(live()).toHaveTextContent('New message from Ava Patel: Hello from ava');

    emit(incoming('n3', 'liam', 'c-liam'));
    expect(live()).toHaveTextContent('New message from Ava Patel: Hello from ava');
  });
});
