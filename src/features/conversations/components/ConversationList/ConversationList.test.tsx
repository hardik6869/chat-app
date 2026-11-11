import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeAll, describe, expect, it } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { ConversationList } from './ConversationList';

function renderList(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ConversationList />
    </MemoryRouter>,
  );
}

const rowFor = (name: string) => screen.getByRole('link', { name: new RegExp(name) });

describe('ConversationList', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  it('shows every conversation, most recent first', () => {
    renderList();
    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(8);
    expect(links[0]).toHaveTextContent('Design Team');
    expect(links[0]).toHaveAttribute('href', '/c/c-design');
  });

  it('shows avatar presence, last message preview, time and unread count', () => {
    renderList();
    const ava = rowFor('Ava Patel');

    expect(within(ava).getByRole('img', { name: 'Ava Patel, online' })).toBeInTheDocument();
    expect(ava).toHaveTextContent("I'll bring the updated illustrations.");
    expect(within(ava).getByText('2 unread messages')).toBeInTheDocument();
    expect(ava.querySelector('time')).toHaveAttribute('dateTime');
  });

  it('prefixes own messages with "You" and group messages with the sender', () => {
    renderList();

    expect(rowFor('Liam Chen')).toHaveTextContent('You: Ping me if you need a review.');
    expect(within(rowFor('Liam Chen')).getByRole('img', { name: 'Delivered' })).toBeInTheDocument();
    expect(
      within(rowFor('Design Team')).queryByRole('img', { name: /Sent|Delivered|Read/ }),
    ).toBeNull();
    expect(rowFor('Design Team')).toHaveTextContent('Mia: Notes from today are in the doc.');
  });

  it('shows typing instead of the preview', () => {
    renderList();
    act(() => {
      useChatStore.getState().handleRealtimeEvent({
        type: 'typing',
        conversationId: 'c-sofia',
        userId: 'sofia',
        isTyping: true,
      });
    });

    expect(rowFor('Sofia Garcia')).toHaveTextContent('typing…');

    act(() => {
      useChatStore.getState().handleRealtimeEvent({
        type: 'typing',
        conversationId: 'c-sofia',
        userId: 'sofia',
        isTyping: false,
      });
    });
    expect(rowFor('Sofia Garcia')).not.toHaveTextContent('typing…');
  });

  it('names attachments when there is no text, and who is typing in groups', () => {
    act(() => {
      useChatStore.setState((state) => {
        const sofia = state.conversations['c-sofia'];
        if (!sofia?.lastMessage) return {};
        const file = {
          id: 'f',
          name: 'menu.pdf',
          type: 'application/pdf',
          size: 10,
          url: 'blob:f',
        };
        return {
          conversations: {
            ...state.conversations,
            'c-sofia': {
              ...sofia,
              lastMessage: { ...sofia.lastMessage, text: '', attachments: [file] },
            },
          },
        };
      });
      useChatStore.getState().handleRealtimeEvent({
        type: 'typing',
        conversationId: 'c-trip',
        userId: 'ethan',
        isTyping: true,
      });
    });
    renderList();

    expect(rowFor('Sofia Garcia')).toHaveTextContent('📎 menu.pdf');
    expect(rowFor('Weekend Trip')).toHaveTextContent('Ethan is typing…');
  });

  it('marks the open conversation as the current page', () => {
    renderList('/c/c-priya');

    expect(rowFor('Priya Sharma')).toHaveAttribute('aria-current', 'page');
    expect(rowFor('Ava Patel')).not.toHaveAttribute('aria-current');
  });

  it('shows a loading skeleton until the session is ready', () => {
    const previous = useChatStore.getState().bootstrapStatus;
    act(() => {
      useChatStore.setState({ bootstrapStatus: 'loading' });
    });
    renderList();

    expect(screen.getByRole('status', { name: 'Loading conversations' })).toBeInTheDocument();
    act(() => {
      useChatStore.setState({ bootstrapStatus: previous });
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderList('/c/c-ava');

    await expectNoA11yViolations(container);
  });
});
