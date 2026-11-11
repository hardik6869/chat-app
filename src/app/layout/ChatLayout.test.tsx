import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/store';
import { routes } from '../routes';

describe('ChatLayout loading and errors', () => {
  it('shows a full-page error when the session fails to load, and retries', async () => {
    const realBootstrap = useChatStore.getState().bootstrap;
    const failingBootstrap = vi.fn(() => {
      useChatStore.setState({ bootstrapStatus: 'error' });
      return Promise.resolve();
    });
    useChatStore.setState({ bootstrap: failingBootstrap });

    render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />);

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load your chats");

    useChatStore.setState({ bootstrap: realBootstrap, bootstrapStatus: 'idle' });
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Chats' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Design Team/ })).toBeInTheDocument();
  });
});
