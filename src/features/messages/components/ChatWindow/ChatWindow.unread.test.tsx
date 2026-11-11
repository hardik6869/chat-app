import { screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useChatStore } from '@/store';
import { mockLayout, renderChat } from '@/test';

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
  });

  it('shows no divider when everything was already read', async () => {
    renderChat('c-liam');

    await screen.findByText('Ping me if you need a review.');
    expect(screen.queryByText(/unread message/)).toBeNull();
  });
});
