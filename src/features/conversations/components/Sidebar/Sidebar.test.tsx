import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeAll, describe, expect, it } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { Sidebar } from './Sidebar';

function renderSidebar() {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
  return { list: () => screen.queryAllByRole('link').map((link) => link.getAttribute('href')) };
}

describe('Sidebar search and filters', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  it('filters by name or message text after a short debounce', async () => {
    const { list } = renderSidebar();
    const search = screen.getByRole('searchbox', { name: 'Search conversations' });

    await userEvent.type(search, 'chen');
    await waitFor(() => {
      expect(list()).toEqual(['/c/c-liam']);
    });
    expect(screen.getByText('1 conversation found')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'interviews');
    await waitFor(() => {
      expect(list()).toEqual(['/c/c-priya']);
    });
  });

  it('shows a helpful empty state when nothing matches', async () => {
    renderSidebar();

    await userEvent.type(screen.getByRole('searchbox'), 'zzz');

    expect(await screen.findByText('No matches')).toBeInTheDocument();
    expect(screen.getByText('0 conversations found')).toBeInTheDocument();
  });

  it('filters unread conversations and groups', async () => {
    const { list } = renderSidebar();
    const filters = screen.getByRole('group', { name: 'Filter conversations' });

    await userEvent.click(within(filters).getByRole('button', { name: 'Unread' }));
    expect(list()).toEqual(['/c/c-design', '/c/c-ava', '/c/c-priya']);

    await userEvent.click(within(filters).getByRole('button', { name: 'Groups' }));
    expect(list()).toEqual(['/c/c-design', '/c/c-engineering', '/c/c-trip']);
    expect(within(filters).getByRole('button', { name: 'Groups' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows "all caught up" when nothing is unread', async () => {
    const conversations = useChatStore.getState().conversations;
    useChatStore.setState({
      conversations: Object.fromEntries(
        Object.entries(conversations).map(([id, item]) => [id, { ...item, unreadCount: 0 }]),
      ),
    });
    renderSidebar();

    await userEvent.click(screen.getByRole('button', { name: 'Unread' }));

    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    useChatStore.setState({ conversations });
  });

  it('focuses search with Ctrl/⌘+K', async () => {
    renderSidebar();

    await userEvent.keyboard('{Control>}k{/Control}');

    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    await expectNoA11yViolations(container);
  });
});
