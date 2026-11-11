import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Message } from '@/entities';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { MessageBubble } from './MessageBubble';

function seedMessage(patch: Partial<Message>) {
  const message: Message = {
    id: 'm-test',
    conversationId: 'c-ava',
    senderId: 'me',
    text: 'Hello there',
    createdAt: new Date(2026, 10, 11, 9, 41).toISOString(),
    status: 'read',
    reactions: [],
    ...patch,
  };
  useChatStore.setState((state) => ({ messages: { ...state.messages, [message.id]: message } }));
  return message;
}

const renderBubble = (isOwn = true) =>
  render(<MessageBubble messageId="m-test" isOwn={isOwn} isFirstInGroup showSender={false} />);

describe('MessageBubble status', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
  });

  it.each([
    ['sending', 'Sending'],
    ['sent', 'Sent'],
    ['delivered', 'Delivered'],
    ['read', 'Read'],
  ] as const)('shows %s on my messages', (status, label) => {
    seedMessage({ status });
    renderBubble();

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('shows no receipts on messages from others', () => {
    seedMessage({ senderId: 'ava' });
    renderBubble(false);

    expect(screen.queryByRole('img', { name: 'Read' })).toBeNull();
  });

  it('offers retry for a failed message', async () => {
    const retryMessage = vi.fn(() => Promise.resolve());
    useChatStore.setState({ retryMessage });
    seedMessage({ status: 'failed' });
    renderBubble();

    expect(screen.getByText('Not sent')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(retryMessage).toHaveBeenCalledWith('m-test');
  });

  it('has no accessibility violations', async () => {
    seedMessage({ status: 'delivered' });
    const { container } = renderBubble();

    await expectNoA11yViolations(container);
  });
});
