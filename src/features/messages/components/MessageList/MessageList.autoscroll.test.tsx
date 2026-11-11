import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '@/entities';
import { useChatStore } from '@/store';
import { MessageList } from './MessageList';

const CONVERSATION = 'c-noah';
const scrollTo = vi.fn();

function incoming(id: string, senderId = 'noah'): Message {
  return {
    id,
    conversationId: CONVERSATION,
    senderId,
    text: `Message ${id}`,
    createdAt: new Date().toISOString(),
    status: 'sent',
    reactions: [],
  };
}

/** Pretend the reader scrolled: far from the bottom (up) or right at it. */
function scrollArea(position: 'up' | 'bottom') {
  const region = screen.getByRole('region', { name: 'Messages' });
  Object.defineProperty(region, 'scrollHeight', { configurable: true, value: 5000 });
  Object.defineProperty(region, 'scrollTop', {
    configurable: true,
    value: position === 'up' ? 0 : 5000 - 800,
  });
  fireEvent.scroll(region);
}

const receive = (message: Message) => {
  act(() => {
    useChatStore.getState().handleRealtimeEvent({ type: 'message:new', message });
  });
};

describe('MessageList auto-scroll', () => {
  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
    await useChatStore.getState().loadMessages(CONVERSATION);
  });

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(60);
    HTMLElement.prototype.scrollTo = scrollTo;
    scrollTo.mockClear();
  });

  it('follows incoming messages while the reader is at the bottom', () => {
    render(<MessageList conversationId={CONVERSATION} />);
    scrollArea('bottom');
    scrollTo.mockClear();

    receive(incoming('a1'));

    expect(scrollTo).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /new message|Jump to latest/ })).toBeNull();
  });

  it('keeps position and counts unseen messages while scrolled up', async () => {
    render(<MessageList conversationId={CONVERSATION} />);
    scrollArea('up');
    expect(screen.getByRole('button', { name: 'Jump to latest message' })).toBeInTheDocument();
    scrollTo.mockClear();

    receive(incoming('b1'));
    receive(incoming('b2'));

    expect(scrollTo).not.toHaveBeenCalled();
    const jump = screen.getByRole('button', { name: '2 new messages' });

    await userEvent.click(jump);
    expect(scrollTo).toHaveBeenCalled();

    scrollArea('bottom');
    expect(screen.queryByRole('button', { name: /new messages/ })).toBeNull();
  });

  it('always scrolls to my own new message', () => {
    render(<MessageList conversationId={CONVERSATION} />);
    scrollArea('up');
    scrollTo.mockClear();

    receive(incoming('c1', 'me'));

    expect(scrollTo).toHaveBeenCalled();
  });
});
