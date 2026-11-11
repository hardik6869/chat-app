import type { Conversation, Message, User } from '@/entities';
import { generateMessages } from './generator';
import { conversationScripts, type ConversationScript } from './scripts';
import { CURRENT_USER_ID, seedUsers } from './users';

export interface Seed {
  currentUserId: string;
  users: User[];
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
}

const MINUTE = 60_000;
export const LARGE_CONVERSATION_ID = 'c-engineering';
const LARGE_MEMBERS = [CURRENT_USER_ID, 'liam', 'noah', 'ethan', 'lucas'];

/** Own messages: last one only delivered (not read yet) when the chat has no unread replies. */
function scriptToMessages(script: ConversationScript, now: number): Message[] {
  const lastIndex = script.lines.length - 1;
  return script.lines.map((line, index) => ({
    id: `${script.id}-m${index}`,
    conversationId: script.id,
    senderId: line.from,
    text: line.text,
    createdAt: new Date(now - line.minutesAgo * MINUTE).toISOString(),
    status: line.from === CURRENT_USER_ID && index === lastIndex ? 'delivered' : 'read',
    replyToId: line.replyTo === undefined ? undefined : `${script.id}-m${line.replyTo}`,
    reactions: Object.entries(line.reactions ?? {}).map(([emoji, userIds]) => ({ emoji, userIds })),
  }));
}

function toConversation(script: ConversationScript, messages: Message[], now: number) {
  const base = {
    id: script.id,
    memberIds: script.memberIds,
    unreadCount: script.unreadCount,
    lastMessage: messages.at(-1),
    createdAt: new Date(now - 60 * 24 * 60 * MINUTE).toISOString(),
  };
  return script.type === 'group'
    ? {
        ...base,
        type: 'group' as const,
        name: script.name ?? 'Group',
        description: script.description,
        adminIds: script.adminIds ?? [],
      }
    : { ...base, type: 'direct' as const };
}

/** Builds the whole mock world relative to `now`, so labels like "Today" always look right. */
export function createSeed(now: number = Date.now()): Seed {
  const messagesByConversation: Record<string, Message[]> = {};
  const conversations: Conversation[] = conversationScripts.map((script) => {
    const messages = scriptToMessages(script, now);
    messagesByConversation[script.id] = messages;
    return toConversation(script, messages, now);
  });

  const largeMessages = generateMessages({
    conversationId: LARGE_CONVERSATION_ID,
    memberIds: LARGE_MEMBERS,
    count: 10_000,
    endAt: now - 50 * MINUTE,
  });
  messagesByConversation[LARGE_CONVERSATION_ID] = largeMessages;
  conversations.push(
    toConversation(
      {
        id: LARGE_CONVERSATION_ID,
        type: 'group',
        name: 'Engineering',
        description: '10,000 messages — virtualized list demo.',
        memberIds: LARGE_MEMBERS,
        adminIds: ['liam'],
        unreadCount: 0,
        lines: [],
      },
      largeMessages,
      now,
    ),
  );

  const users = seedUsers.map(({ lastSeenMinutesAgo, ...user }) => ({
    ...user,
    lastSeenAt:
      lastSeenMinutesAgo === undefined
        ? undefined
        : new Date(now - lastSeenMinutesAgo * MINUTE).toISOString(),
  }));

  return { currentUserId: CURRENT_USER_ID, users, conversations, messagesByConversation };
}
