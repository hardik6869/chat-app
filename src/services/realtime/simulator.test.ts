import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '@/entities';
import { createSeed } from '../mock-data';
import { createDatabase } from '../mock-server';
import { createRealtimeSimulator, type RealtimeEvent } from './index';

const NOW = new Date(2026, 10, 11, 15, 30).getTime();
const NEVER = 1e9;

function setup(options: Parameters<typeof createRealtimeSimulator>[1] = {}) {
  const db = createDatabase(createSeed(NOW));
  const simulator = createRealtimeSimulator(db, {
    random: () => 0,
    ...options,
    timing: { ambientMinMs: NEVER, ambientMaxMs: NEVER, ...options.timing },
  });
  const events: RealtimeEvent[] = [];
  const unsubscribe = simulator.subscribe((event) => events.push(event));
  simulator.connect();
  return { db, simulator, events, unsubscribe };
}

function sendOwnMessage(db: ReturnType<typeof createDatabase>, conversationId = 'c-ava') {
  const message: Message = {
    id: 'msg_own',
    conversationId,
    senderId: 'me',
    text: 'Hello?',
    createdAt: new Date(NOW).toISOString(),
    status: 'sent',
    reactions: [],
  };
  db.messages.get(conversationId)?.push(message);
  return message;
}

describe('realtime simulator', () => {
  // jsdom reports the page as hidden by default; simulate a visible tab.
  const setHidden = (hidden: boolean) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
    document.dispatchEvent(new Event('visibilitychange'));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(document, 'hidden');
  });

  it('marks sent messages delivered, then read, in the database too', () => {
    const { db, simulator, events } = setup({ autoReplyRate: 0 });
    const message = sendOwnMessage(db);

    simulator.send({ type: 'message:sent', message });
    vi.advanceTimersByTime(800);
    expect(events).toEqual([
      {
        type: 'message:status',
        conversationId: 'c-ava',
        messageId: 'msg_own',
        status: 'delivered',
      },
    ]);

    vi.advanceTimersByTime(1200);
    expect(events.at(-1)).toMatchObject({ status: 'read' });
    expect(db.messages.get('c-ava')?.at(-1)?.status).toBe('read');
  });

  it('replies with a typing indicator followed by a new message', () => {
    const { db, simulator, events } = setup();
    const unreadBefore = db.conversations.get('c-ava')?.unreadCount ?? 0;

    simulator.send({ type: 'message:sent', message: sendOwnMessage(db) });
    vi.advanceTimersByTime(3200);
    expect(events.at(-1)).toEqual({
      type: 'typing',
      conversationId: 'c-ava',
      userId: 'ava',
      isTyping: true,
    });

    vi.advanceTimersByTime(1680);
    const [typingOff, incoming] = events.slice(-2);
    expect(typingOff).toMatchObject({ type: 'typing', isTyping: false });
    expect(incoming).toMatchObject({
      type: 'message:new',
      message: { senderId: 'ava', conversationId: 'c-ava', text: 'Sounds good!' },
    });
    expect(db.conversations.get('c-ava')?.unreadCount).toBe(unreadBefore + 1);
    expect(db.conversations.get('c-ava')?.lastMessage?.text).toBe('Sounds good!');
  });

  it('ignores sends while disconnected and cancels pending work on disconnect', () => {
    const { db, simulator, events } = setup();

    simulator.send({ type: 'message:sent', message: sendOwnMessage(db) });
    simulator.disconnect();
    vi.advanceTimersByTime(10_000);
    simulator.send({ type: 'message:sent', message: sendOwnMessage(db) });
    vi.advanceTimersByTime(10_000);

    expect(events).toEqual([]);
  });

  it('stops notifying unsubscribed listeners', () => {
    const { db, simulator, events, unsubscribe } = setup({ autoReplyRate: 0 });

    unsubscribe();
    simulator.send({ type: 'message:sent', message: sendOwnMessage(db) });
    vi.advanceTimersByTime(5000);

    expect(events).toEqual([]);
  });

  describe('ambient activity', () => {
    const timing = { ambientMinMs: 1000, ambientMaxMs: 1000 };

    it('produces incoming messages or presence changes over time', () => {
      const { events, simulator } = setup({ timing });
      simulator.connect(); // connecting twice must not start a second timer

      // +1 ms: the typing timer is queued from inside the ambient timer.
      vi.advanceTimersByTime(1001);
      expect(events).toEqual([expect.objectContaining({ type: 'typing', isTyping: true })]);

      vi.advanceTimersByTime(3000);
      expect(events.some((event) => event.type === 'message:new')).toBe(true);
    });

    it('toggles presence and updates the database', () => {
      const { db, events } = setup({ timing, random: () => 0.9 });
      const userBefore = [...db.users.values()].filter((user) => user.id !== 'me')[
        Math.floor(0.9 * (db.users.size - 1))
      ];

      vi.advanceTimersByTime(1000);

      const presence = events.find((event) => event.type === 'presence');
      expect(presence).toMatchObject({ userId: userBefore?.id, isOnline: !userBefore?.isOnline });
      expect(db.users.get(userBefore?.id ?? '')?.isOnline).toBe(!userBefore?.isOnline);
    });

    it('pauses while the tab is hidden and resumes when visible', () => {
      const { events } = setup({ timing });

      setHidden(true);
      vi.advanceTimersByTime(5000);
      expect(events).toEqual([]);

      setHidden(false);
      vi.advanceTimersByTime(1001);
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
