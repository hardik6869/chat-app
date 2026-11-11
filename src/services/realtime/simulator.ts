import { isGroup, type Conversation, type Message } from '@/entities';
import { createId } from '@/shared/lib';
import type { Database } from '../mock-server';
import type { ClientEvent, RealtimeEvent, RealtimeListener } from './events';

const REPLIES = [
  'Sounds good!',
  'On it 👍',
  'Let me check and get back to you.',
  'Haha, love it 😄',
  'Thanks, that helps a lot.',
  'Can we talk about this tomorrow?',
  'Makes sense to me.',
  'Great idea!',
  'Just saw this — looking now.',
  'Agreed 💯',
];

const DEFAULT_TIMING = {
  deliveredMs: 800,
  readMs: 2000,
  replyDelayMs: 1200,
  ambientMinMs: 12_000,
  ambientMaxMs: 25_000,
};

interface SimulatorOptions {
  random?: () => number;
  timing?: Partial<typeof DEFAULT_TIMING>;
  /** Chance that a sent message gets a reply. */
  autoReplyRate?: number;
}

/** Fake realtime server: delivery/read receipts, typing, replies, incoming chatter and presence. */
export function createRealtimeSimulator(db: Database, options: SimulatorOptions = {}) {
  const { random = Math.random, autoReplyRate = 0.8 } = options;
  const timing = { ...DEFAULT_TIMING, ...options.timing };
  const listeners = new Set<RealtimeListener>();
  const timers = new Set<number>();
  let ambientTimer: number | undefined;
  let connected = false;

  const pick = <T>(items: readonly T[]): T | undefined =>
    items[Math.floor(random() * items.length)];
  const typingMs = (text: string) => 1200 + Math.min(text.length * 40, 2500);

  function emit(event: RealtimeEvent) {
    listeners.forEach((listener) => {
      listener(event);
    });
  }

  function schedule(delayMs: number, task: () => void) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      task();
    }, delayMs);
    timers.add(id);
  }

  function setStatus(message: Message, status: 'delivered' | 'read') {
    const messages = db.messages.get(message.conversationId) ?? [];
    const index = messages.findIndex((item) => item.id === message.id);
    const current = messages[index];
    if (!current) return;
    const next = { ...current, status };
    messages[index] = next;
    const conversation = db.conversations.get(message.conversationId);
    if (conversation?.lastMessage?.id === next.id) conversation.lastMessage = next;
    emit({
      type: 'message:status',
      conversationId: message.conversationId,
      messageId: message.id,
      status,
    });
  }

  function receive(conversation: Conversation, senderId: string, text: string) {
    const message: Message = {
      id: createId('msg'),
      conversationId: conversation.id,
      senderId,
      text,
      createdAt: new Date().toISOString(),
      status: 'sent',
      reactions: [],
    };
    db.messages.get(conversation.id)?.push(message);
    conversation.lastMessage = message;
    conversation.unreadCount += 1;
    emit({ type: 'typing', conversationId: conversation.id, userId: senderId, isTyping: false });
    emit({ type: 'message:new', message });
  }

  /** Someone types for a while, then sends. */
  function simulateIncoming(conversation: Conversation, delayMs: number) {
    const senderId = pick(conversation.memberIds.filter((id) => id !== db.currentUserId));
    const text = pick(REPLIES);
    if (!senderId || !text) return;
    schedule(delayMs, () => {
      emit({ type: 'typing', conversationId: conversation.id, userId: senderId, isTyping: true });
      schedule(typingMs(text), () => {
        receive(conversation, senderId, text);
      });
    });
  }

  function togglePresence() {
    const user = pick([...db.users.values()].filter((item) => item.id !== db.currentUserId));
    if (!user) return;
    const isOnline = !user.isOnline;
    const lastSeenAt = isOnline ? undefined : new Date().toISOString();
    db.users.set(user.id, { ...user, isOnline, lastSeenAt });
    emit({ type: 'presence', userId: user.id, isOnline, lastSeenAt });
  }

  function startAmbient() {
    if (ambientTimer !== undefined) return;
    const { ambientMinMs: min, ambientMaxMs: max } = timing;
    ambientTimer = window.setTimeout(
      () => {
        ambientTimer = undefined;
        const conversation = pick([...db.conversations.values()]);
        if (random() < 0.6 && conversation) simulateIncoming(conversation, 0);
        else togglePresence();
        startAmbient();
      },
      min + random() * (max - min),
    );
  }

  function stopAmbient() {
    window.clearTimeout(ambientTimer);
    ambientTimer = undefined;
  }

  /** Background chatter pauses while the tab is hidden, saving work and battery. */
  function handleVisibility() {
    if (document.hidden) stopAmbient();
    else startAmbient();
  }

  return {
    connect() {
      if (connected) return;
      connected = true;
      document.addEventListener('visibilitychange', handleVisibility);
      if (!document.hidden) startAmbient();
    },

    disconnect() {
      connected = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      stopAmbient();
      timers.forEach((id) => {
        window.clearTimeout(id);
      });
      timers.clear();
    },

    subscribe(listener: RealtimeListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    send(event: ClientEvent) {
      if (!connected) return;
      const { message } = event;
      const conversation = db.conversations.get(message.conversationId);
      if (!conversation) return;
      schedule(timing.deliveredMs, () => {
        setStatus(message, 'delivered');
      });
      schedule(timing.readMs, () => {
        setStatus(message, 'read');
      });
      const replyRate = isGroup(conversation) ? autoReplyRate * 0.6 : autoReplyRate;
      if (random() < replyRate) simulateIncoming(conversation, timing.readMs + timing.replyDelayMs);
    },
  };
}
