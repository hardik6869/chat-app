import { act, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { formatTyping } from '../../hooks';
import { TypingIndicator } from './TypingIndicator';

const setTyping = (userId: string, isTyping: boolean, conversationId = 'c-design') => {
  act(() => {
    useChatStore
      .getState()
      .handleRealtimeEvent({ type: 'typing', conversationId, userId, isTyping });
  });
};

describe('formatTyping', () => {
  it.each([
    [[], null],
    [['Ava Patel'], 'Ava is typing…'],
    [['Ava Patel', 'Liam Chen'], 'Ava and Liam are typing…'],
    [['Ava Patel', 'Liam Chen', 'Mia Johnson'], 'Ava and 2 others are typing…'],
  ])('%j → %s', (names, expected) => {
    expect(formatTyping(names)).toBe(expected);
  });
});

describe('TypingIndicator', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  it('shows who is typing in a live region and hides when they stop', () => {
    const { container } = render(<TypingIndicator conversationId="c-design" />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeEmptyDOMElement();

    setTyping('ava', true);
    setTyping('sofia', true);
    expect(region).toHaveTextContent('Ava and Sofia are typing…');

    setTyping('ava', false);
    expect(region).toHaveTextContent('Sofia is typing…');

    setTyping('sofia', false);
    expect(region).toBeEmptyDOMElement();
  });

  it('ignores other conversations and the current user', () => {
    render(<TypingIndicator conversationId="c-design" />);

    setTyping('ava', true, 'c-ava');
    setTyping('me', true);

    expect(screen.queryByText(/typing/)).toBeNull();
    setTyping('ava', false, 'c-ava');
    setTyping('me', false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TypingIndicator conversationId="c-design" />);
    setTyping('mia', true);

    await expectNoA11yViolations(container);
    setTyping('mia', false);
  });
});
