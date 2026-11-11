import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations, mockLayout, renderChat } from '@/test';

const CONVERSATION = 'c-ava';
const messageRow = (text: string) => {
  const row = screen.getByText(text).closest('[role="listitem"]');
  if (!(row instanceof HTMLElement)) throw new Error(`No row for "${text}"`);
  return row;
};

describe('Reply to a message', () => {
  const sendMessage = vi.fn(() => Promise.resolve());

  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
    sendMessage.mockClear();
    useChatStore.setState({ sendMessage, composerTargets: {}, drafts: {} });
  });

  it('quotes the original message inside a reply bubble', async () => {
    renderChat(CONVERSATION);
    const reply = await waitFor(() => messageRow('Sure — does 3 PM work?'));

    const quote = within(reply).getByRole('blockquote');
    expect(quote).toHaveTextContent('You');
    expect(quote).toHaveTextContent('Can we sync on the empty states before Friday?');
  });

  it('replies from the action pill and sends with the quoted message', async () => {
    renderChat(CONVERSATION);
    const original = await waitFor(() => messageRow('Perfect, thanks 🙌'));

    await userEvent.click(within(original).getByRole('button', { name: 'Reply' }));

    const composer = screen.getByRole('textbox', { name: 'Message' });
    expect(screen.getByText('Replying to')).toBeInTheDocument();
    expect(composer).toHaveFocus();

    await userEvent.type(composer, 'Happy to help!{Enter}');

    expect(sendMessage).toHaveBeenCalledWith(CONVERSATION, 'Happy to help!', 'c-ava-m2');
    expect(screen.queryByText('Replying to')).toBeNull();
  });

  it('cancels a reply with Escape or the close button', async () => {
    renderChat(CONVERSATION);
    const original = await waitFor(() => messageRow('Perfect, thanks 🙌'));

    await userEvent.click(within(original).getByRole('button', { name: 'Reply' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Replying to')).toBeNull();

    await userEvent.click(within(original).getByRole('button', { name: 'Reply' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel reply' }));
    expect(screen.queryByText('Replying to')).toBeNull();
  });

  it('has no accessibility violations while replying', async () => {
    const { container } = renderChat(CONVERSATION);
    const original = await waitFor(() => messageRow('Perfect, thanks 🙌'));
    await userEvent.click(within(original).getByRole('button', { name: 'Reply' }));

    await expectNoA11yViolations(container);
  });
});
