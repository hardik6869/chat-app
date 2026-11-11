import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/shared/ui';
import { useChatStore } from '@/store';
import { mockLayout, renderChat } from '@/test';

const CONVERSATION = 'c-ava';
const OWN_TEXT = 'Can we sync on the empty states before Friday?';
const THEIR_TEXT = 'Perfect, thanks 🙌';

const rowOf = (text: string) =>
  waitFor(() => {
    const row = screen.getAllByText(text)[0]?.closest('[role="listitem"]');
    if (!(row instanceof HTMLElement)) throw new Error(`No row for "${text}"`);
    return row;
  });
const composer = () => screen.getByRole('textbox', { name: 'Message' });

describe('Message actions', () => {
  const editMessage = vi.fn(() => Promise.resolve());
  const deleteMessage = vi.fn(() => Promise.resolve());

  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
    editMessage.mockClear();
    deleteMessage.mockClear();
    useChatStore.setState({
      editMessage,
      deleteMessage,
      composerTargets: {},
      drafts: {},
      pendingDeleteId: undefined,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('offers edit and delete only on my own messages', async () => {
    renderChat(CONVERSATION);

    const theirs = within(await rowOf(THEIR_TEXT));
    expect(theirs.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
    expect(theirs.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(theirs.queryByRole('button', { name: 'Delete' })).toBeNull();

    const mine = within(await rowOf(OWN_TEXT));
    expect(mine.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(mine.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('copies text and confirms with a toast', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<Toaster />);
    renderChat(CONVERSATION);

    await userEvent.click(
      within(await rowOf(THEIR_TEXT)).getByRole('button', { name: 'Copy text' }),
    );

    expect(writeText).toHaveBeenCalledWith(THEIR_TEXT);
    expect(await screen.findByText('Copied to clipboard')).toBeInTheDocument();
  });

  it('edits in the composer and restores the draft afterwards', async () => {
    useChatStore.setState({ drafts: { [CONVERSATION]: 'my draft' } });
    renderChat(CONVERSATION);

    await userEvent.click(within(await rowOf(OWN_TEXT)).getByRole('button', { name: 'Edit' }));
    expect(screen.getByText('Editing message')).toBeInTheDocument();
    expect(composer()).toHaveValue(OWN_TEXT);

    await userEvent.clear(composer());
    await userEvent.type(composer(), 'Can we sync on Thursday instead?{Enter}');

    expect(editMessage).toHaveBeenCalledWith('c-ava-m3', 'Can we sync on Thursday instead?');
    expect(screen.queryByText('Editing message')).toBeNull();
    expect(composer()).toHaveValue('my draft');
  });

  it('cancels editing with Escape without saving', async () => {
    renderChat(CONVERSATION);
    await userEvent.click(within(await rowOf(OWN_TEXT)).getByRole('button', { name: 'Edit' }));

    await userEvent.keyboard('{Escape}');

    expect(editMessage).not.toHaveBeenCalled();
    expect(composer()).toHaveValue('');
  });

  it('edits my last message with ↑ in an empty composer', async () => {
    renderChat(CONVERSATION);
    await rowOf(OWN_TEXT);

    await userEvent.click(composer());
    await userEvent.keyboard('{ArrowUp}');

    expect(screen.getByText('Editing message')).toBeInTheDocument();
    expect(composer()).toHaveValue(OWN_TEXT);
  });

  it('asks before deleting, and can be cancelled', async () => {
    renderChat(CONVERSATION);
    const mine = within(await rowOf(OWN_TEXT));

    await userEvent.click(mine.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete message?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(deleteMessage).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(mine.getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }),
    );
    expect(deleteMessage).toHaveBeenCalledWith('c-ava-m3');
  });
});
