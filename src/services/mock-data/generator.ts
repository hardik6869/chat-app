import type { Message } from '@/entities';

const LINES = [
  'Pushed the fix, can someone review?',
  'Deploying to staging now.',
  'Tests are green on main.',
  'Looks like a flaky test, re-running.',
  'Can we pair on this after lunch?',
  'The p95 latency dropped by 30% 🎉',
  'Opened a ticket for the memory leak.',
  'LGTM, merging.',
  'Who owns the notifications service?',
  'Rolling back, error rate spiked.',
  'Rollback done, investigating.',
  'Found it — a missing index on messages.created_at.',
  'Standup in 5.',
  'Docs are updated with the new env vars.',
  'Bumped dependencies, no breaking changes.',
  'Can I get a second pair of eyes on the migration?',
  'Feature flag is on for 10% of users.',
  'Retro notes are in the wiki.',
  'Nice catch 👀',
  'On call handover: all quiet.',
];

const EMOJIS = ['👍', '❤️', '😂', '🎉', '👀'];

/** Small deterministic PRNG (mulberry32) so generated data is stable across runs and tests. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface GenerateOptions {
  conversationId: string;
  memberIds: string[];
  count: number;
  /** Timestamp of the newest message. */
  endAt: number;
  seed?: number;
}

/** Builds `count` messages ending at `endAt`, oldest first, 1–40 minutes apart. */
export function generateMessages({
  conversationId,
  memberIds,
  count,
  endAt,
  seed = 42,
}: GenerateOptions): Message[] {
  const random = createRandom(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T;
  const messages: Message[] = [];
  let time = endAt;

  for (let index = count - 1; index >= 0; index -= 1) {
    const reacted = random() < 0.05;
    messages.push({
      id: `${conversationId}-g${index}`,
      conversationId,
      senderId: pick(memberIds),
      text: pick(LINES),
      createdAt: new Date(time).toISOString(),
      status: 'read',
      reactions: reacted ? [{ emoji: pick(EMOJIS), userIds: [pick(memberIds)] }] : [],
    });
    time -= (1 + Math.floor(random() * 40)) * 60_000;
  }

  return messages.reverse();
}
