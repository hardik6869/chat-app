import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_MESSAGE_LENGTH } from '@/entities';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { Composer } from './Composer';

const CONVERSATION = 'c-sofia';
const field = () => screen.getByRole('textbox', { name: 'Message' });
const sendButton = () => screen.getByRole('button', { name: 'Send message' });

describe('Composer', () => {
  const sendMessage = vi.fn(() => Promise.resolve());

  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
    await useChatStore.getState().loadMessages(CONVERSATION);
  });

  beforeEach(() => {
    sendMessage.mockClear();
    useChatStore.setState({ sendMessage, drafts: {} });
  });

  it('sends with Enter, then clears the field and the draft', async () => {
    render(<Composer conversationId={CONVERSATION} />);

    await userEvent.type(field(), 'Hello Sofia{Enter}');

    expect(sendMessage).toHaveBeenCalledWith(CONVERSATION, 'Hello Sofia', undefined);
    expect(field()).toHaveValue('');
    expect(useChatStore.getState().drafts[CONVERSATION]).toBeUndefined();
    expect(field()).toHaveFocus();
  });

  it('adds a new line with Shift+Enter instead of sending', async () => {
    render(<Composer conversationId={CONVERSATION} />);

    await userEvent.type(field(), 'Line one{Shift>}{Enter}{/Shift}Line two');

    expect(field()).toHaveValue('Line one\nLine two');
    expect(sendMessage).not.toHaveBeenCalled();

    await userEvent.click(sendButton());
    expect(sendMessage).toHaveBeenCalledWith(CONVERSATION, 'Line one\nLine two', undefined);
  });

  it('does not send blank messages or while an IME is composing', async () => {
    render(<Composer conversationId={CONVERSATION} />);
    expect(sendButton()).toBeDisabled();

    await userEvent.type(field(), '   {Enter}');
    expect(sendMessage).not.toHaveBeenCalled();
    expect(sendButton()).toBeDisabled();

    await userEvent.type(field(), 'こんにちは');
    fireEvent.keyDown(field(), { key: 'Enter', isComposing: true });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('keeps an unsent draft per conversation', async () => {
    const { unmount } = render(<Composer conversationId={CONVERSATION} />);
    await userEvent.type(field(), 'Half a thought');
    unmount();

    expect(useChatStore.getState().drafts[CONVERSATION]).toBe('Half a thought');

    render(<Composer conversationId={CONVERSATION} />);
    expect(field()).toHaveValue('Half a thought');
  });

  it('shows a counter near the limit and caps the length', () => {
    act(() => {
      useChatStore.setState({ drafts: { [CONVERSATION]: 'a'.repeat(MAX_MESSAGE_LENGTH - 100) } });
    });
    render(<Composer conversationId={CONVERSATION} />);

    expect(
      screen.getByText(`${MAX_MESSAGE_LENGTH - 100} / ${MAX_MESSAGE_LENGTH}`),
    ).toBeInTheDocument();
    expect(field()).toHaveAttribute('maxLength', String(MAX_MESSAGE_LENGTH));
  });

  it('stays disabled until the conversation has loaded', () => {
    render(<Composer conversationId="c-noah" />);

    expect(field()).toBeDisabled();
    expect(field()).toHaveAttribute('placeholder', 'Loading messages…');
    expect(sendButton()).toBeDisabled();
  });

  it('explains the keyboard shortcuts and has no accessibility violations', async () => {
    const { container } = render(<Composer conversationId={CONVERSATION} />);

    expect(field()).toHaveAccessibleDescription(
      'Press Enter to send and Shift+Enter for a new line.',
    );
    await expectNoA11yViolations(container);
  });
});
