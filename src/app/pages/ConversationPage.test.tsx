import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/shared/ui';
import { useChatStore } from '@/store';
import { expectNoA11yViolations, mockLayout } from '@/test';
import { routes } from '../routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>,
  );
}

const openInfo = async () => {
  await userEvent.click(await screen.findByRole('button', { name: 'Group info' }));
  // The panel is lazy-loaded: its first import can take a moment.
  return screen.findByRole('complementary', { name: 'Group info' }, { timeout: 3000 });
};

describe('Group info', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
  });

  it('is offered for groups only', async () => {
    renderAt('/c/c-ava');
    await screen.findByRole('heading', { name: 'Ava Patel' });

    expect(screen.queryByRole('button', { name: 'Group info' })).toBeNull();
  });

  it('shows the group, members, presence and admins', async () => {
    renderAt('/c/c-design');
    const panel = within(await openInfo());

    expect(panel.getByText('Product design, reviews and critiques.')).toBeInTheDocument();
    expect(panel.getByText(/5 members · \d online/)).toBeInTheDocument();
    const items = panel.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Jordan Lee (You)');
    expect(items[0]).toHaveTextContent('Admin');
    expect(panel.getByRole('img', { name: 'Ava Patel, online' })).toBeInTheDocument();
    expect(panel.queryByRole('button', { name: 'Remove Jordan Lee' })).toBeNull();
  });

  it('removes a member and confirms with a toast', async () => {
    renderAt('/c/c-trip');
    const panel = within(await openInfo());

    await userEvent.click(panel.getByRole('button', { name: 'Remove Ethan Brown' }));

    expect(await screen.findByText('Removed Ethan Brown')).toBeInTheDocument();
    expect(panel.queryByRole('button', { name: 'Remove Ethan Brown' })).toBeNull();
    // …and he can be added back.
    expect(panel.getByRole('option', { name: 'Ethan Brown', hidden: true })).toBeInTheDocument();
    expect(useChatStore.getState().conversations['c-trip']?.memberIds).not.toContain('ethan');
  });

  it('adds a member with the form, validating the choice', async () => {
    renderAt('/c/c-trip');
    const panel = within(await openInfo());

    await userEvent.click(panel.getByRole('button', { name: 'Add member' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Add member' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Add' }));
    expect(dialog.getByRole('alert')).toHaveTextContent('Choose a person to add');

    await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'Person' }), 'Ava Patel');
    await userEvent.click(dialog.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Added Ava Patel')).toBeInTheDocument();
    expect(panel.getByText('Ava Patel')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('reports a failed member change', async () => {
    const realAdd = useChatStore.getState().addMember;
    useChatStore.setState({ addMember: vi.fn().mockRejectedValue(new Error('offline')) });
    renderAt('/c/c-trip');
    const panel = within(await openInfo());

    await userEvent.click(panel.getByRole('button', { name: 'Add member' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Add member' }));
    await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'Person' }), 'Priya Sharma');
    await userEvent.click(dialog.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText("Couldn't add Priya Sharma")).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Add member' })).toBeInTheDocument();
    useChatStore.setState({ addMember: realAdd });
  });

  it('closes with Escape and returns focus to the button', async () => {
    renderAt('/c/c-design');
    await openInfo();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('complementary', { name: 'Group info' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Group info' })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderAt('/c/c-design');
    await openInfo();

    await expectNoA11yViolations(container);
  });
});
