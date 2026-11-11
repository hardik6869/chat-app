import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { routes } from './routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('App routes', () => {
  it('shows the sidebar and an empty chat area at the root', async () => {
    renderAt('/');

    expect(screen.getByRole('heading', { level: 1, name: 'Chats' })).toBeInTheDocument();
    expect(await screen.findByText('Select a conversation')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to conversation' })).toHaveAttribute(
      'href',
      '#main',
    );
  });

  it('opens a conversation from the URL', async () => {
    renderAt('/c/c-ava');

    expect(await screen.findByRole('heading', { level: 2, name: 'Ava Patel' })).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to conversations' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('describes groups by members', async () => {
    renderAt('/c/c-design');

    expect(await screen.findByRole('heading', { name: 'Design Team' })).toBeInTheDocument();
    expect(screen.getByText(/5 members, \d online/)).toBeInTheDocument();
  });

  it('handles unknown conversations and pages', async () => {
    renderAt('/c/missing');
    expect(await screen.findByText('Conversation not found')).toBeInTheDocument();
  });

  it('shows a not-found page for unknown URLs', () => {
    renderAt('/nope');
    expect(screen.getByRole('link', { name: 'Go to chats' })).toHaveAttribute('href', '/');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderAt('/c/c-ava');
    await screen.findByRole('heading', { name: 'Ava Patel' });

    await expectNoA11yViolations(container);
  });
});
