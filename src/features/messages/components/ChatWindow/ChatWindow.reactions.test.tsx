import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations, mockLayout, renderChat } from '@/test';
import { joinNames } from '../../lib';

const CONVERSATION = 'c-design';
const REACTED_TEXT = 'The dark theme looks so much calmer now.';

const rowOf = (text: string) =>
  waitFor(() => {
    const row = screen.getAllByText(text)[0]?.closest('[role="listitem"]');
    if (!(row instanceof HTMLElement)) throw new Error(`No row for "${text}"`);
    return row;
  });

describe('joinNames', () => {
  it.each([
    [[], ''],
    [['Ava'], 'Ava'],
    [['Ava', 'you'], 'Ava and you'],
    [['Ava', 'Liam', 'you'], 'Ava, Liam and you'],
  ])('%j → "%s"', (names, expected) => {
    expect(joinNames(names)).toBe(expected);
  });
});

describe('Reactions', () => {
  const toggleReaction = vi.fn(() => Promise.resolve());

  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  beforeEach(() => {
    mockLayout();
    toggleReaction.mockClear();
    useChatStore.setState({ toggleReaction });
  });

  it('shows reaction chips with counts, highlighting my own', async () => {
    renderChat(CONVERSATION);
    const reactions = within(await rowOf(REACTED_TEXT)).getByRole('list', { name: 'Reactions' });

    const chip = within(reactions).getByRole('button', {
      name: '👍 2, reacted by Sofia Garcia and you',
    });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip).toHaveAttribute('title', 'Sofia Garcia and you');

    await userEvent.click(chip);
    expect(toggleReaction).toHaveBeenCalledWith('c-design-m1', '👍');
  });

  it('opens the picker, focuses the first emoji and reacts', async () => {
    renderChat(CONVERSATION);
    const row = within(await rowOf(REACTED_TEXT));
    const trigger = row.getByRole('button', { name: 'React' });

    await userEvent.click(trigger);
    const picker = screen.getByRole('group', { name: 'Pick a reaction' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(picker).getByRole('button', { name: 'React with Thumbs up' })).toHaveFocus();

    await userEvent.click(within(picker).getByRole('button', { name: 'React with Party' }));

    expect(toggleReaction).toHaveBeenCalledWith('c-design-m1', '🎉');
    expect(screen.queryByRole('group', { name: 'Pick a reaction' })).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('closes the picker with Escape', async () => {
    renderChat(CONVERSATION);
    const trigger = within(await rowOf(REACTED_TEXT)).getByRole('button', { name: 'React' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('group', { name: 'Pick a reaction' })).toBeNull();
    expect(trigger).toHaveFocus();
    expect(toggleReaction).not.toHaveBeenCalled();
  });

  it('has no accessibility violations with the picker open', async () => {
    const { container } = renderChat(CONVERSATION);
    await userEvent.click(within(await rowOf(REACTED_TEXT)).getByRole('button', { name: 'React' }));

    await expectNoA11yViolations(container);
  });
});
