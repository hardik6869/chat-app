import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/shared/ui';
import { useChatStore } from '@/store';
import { mockLayout, renderChat } from '@/test';

const CONVERSATION = 'c-ava';
const OWN_TEXT = 'Can we sync on the empty states before Friday?';

const rowOf = (text: string) =>
  waitFor(() => {
    const row = screen.getAllByText(text)[0]?.closest('[role="listitem"]');
    if (!(row instanceof HTMLElement)) throw new Error(`No row for "${text}"`);
    return row;
  });

describe('Message failures and touch', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
    HTMLElement.prototype.scrollTo = vi.fn();
    render(<Toaster />);
  });

  it('opens the action pill with a long-press and closes it when pressing elsewhere', async () => {
    renderChat(CONVERSATION);
    const row = await rowOf(OWN_TEXT);
    const group = row.querySelector('.group');
    if (!(group instanceof HTMLElement)) throw new Error('No message row');

    fireEvent.contextMenu(group);
    expect(group).toHaveAttribute('data-actions', 'open');

    fireEvent.pointerDown(document.body);
    expect(group).not.toHaveAttribute('data-actions');
  });

  it('tells the user when a delete fails', async () => {
    useChatStore.setState({ deleteMessage: vi.fn().mockRejectedValue(new Error('offline')) });
    renderChat(CONVERSATION);

    await userEvent.click(within(await rowOf(OWN_TEXT)).getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }),
    );

    expect(await screen.findByText("Couldn't delete the message")).toBeInTheDocument();
  });

  it('tells the user when a reaction fails', async () => {
    useChatStore.setState({ toggleReaction: vi.fn().mockRejectedValue(new Error('offline')) });
    renderChat(CONVERSATION);

    await userEvent.click(within(await rowOf(OWN_TEXT)).getByRole('button', { name: 'React' }));
    await userEvent.click(screen.getByRole('button', { name: 'React with Heart' }));

    expect(await screen.findByText("Couldn't update your reaction")).toBeInTheDocument();
  });

  it('gives up jumping to a message that does not exist', async () => {
    renderChat(CONVERSATION);
    await rowOf(OWN_TEXT);

    act(() => {
      useChatStore.getState().focusMessage('missing-message');
    });

    await waitFor(() => {
      expect(useChatStore.getState().focusedMessageId).toBeUndefined();
    });
  });
});
