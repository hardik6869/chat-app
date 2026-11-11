import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations, mockLayout, renderChat } from '@/test';
import { splitMatches } from '../../lib';

const CONVERSATION = 'c-design';
const searchButton = () => screen.getByRole('button', { name: 'Search messages' });
const searchBox = () => screen.getByRole('searchbox', { name: 'Search messages' });

describe('splitMatches', () => {
  it('marks every case-insensitive match', () => {
    expect(splitMatches('Tokens and more tokens', 'TOKENS')).toEqual([
      { text: 'Tokens', match: true },
      { text: ' and more ', match: false },
      { text: 'tokens', match: true },
    ]);
    expect(splitMatches('Hello', ' ')).toEqual([{ text: 'Hello', match: false }]);
  });
});

describe('Message search', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  it('finds messages, highlights matches and jumps to the picked one', async () => {
    renderChat(CONVERSATION);
    await userEvent.click(searchButton());
    expect(searchBox()).toHaveFocus();

    await userEvent.type(searchBox(), 'tokens');
    const result = await screen.findByRole('button', { name: /Shared the new color tokens/ });
    expect(within(result).getByText('tokens', { selector: 'mark' })).toBeInTheDocument();
    expect(screen.getByText('1 result')).toBeInTheDocument();

    await userEvent.click(result);

    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(useChatStore.getState().focusedMessageId).toBe('c-design-m0');
    await waitFor(() => {
      expect(
        screen.getByText('Shared the new color tokens in the library.').closest('.ring-2'),
      ).not.toBeNull();
    });
  });

  it('opens with Ctrl/⌘+F; Esc clears, then closes and returns focus', async () => {
    renderChat(CONVERSATION);
    await screen.findByText('Notes from today are in the doc.');

    await userEvent.keyboard('{Control>}f{/Control}');
    await userEvent.type(searchBox(), 'zzz');
    expect(await screen.findByText(/No messages match/)).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(searchBox()).toHaveValue('');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(searchButton()).toHaveFocus();
  });

  it('offers a retry when searching fails', async () => {
    const searchMessages = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([]);
    useChatStore.setState({ searchMessages });
    renderChat(CONVERSATION);
    await userEvent.click(searchButton());

    await userEvent.type(searchBox(), 'notes');
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't search messages.");

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/No messages match/)).toBeInTheDocument();
    expect(searchMessages).toHaveBeenCalledTimes(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderChat(CONVERSATION);
    await userEvent.click(searchButton());

    await expectNoA11yViolations(container);
  });
});
