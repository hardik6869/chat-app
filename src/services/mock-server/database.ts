import type { Conversation, Message, User } from '@/entities';
import { createSeed, type Seed } from '../mock-data';

/**
 * In-memory "server" storage shared by the mock API and the realtime simulator.
 * Writers call `touch()` after a change so persistence can save.
 */
export function createDatabase(seed: Seed = createSeed(), onChange: () => void = () => undefined) {
  return {
    currentUserId: seed.currentUserId,
    users: new Map<string, User>(seed.users.map((user) => [user.id, user])),
    conversations: new Map<string, Conversation>(
      seed.conversations.map((conversation) => [conversation.id, conversation]),
    ),
    messages: new Map<string, Message[]>(Object.entries(seed.messagesByConversation)),
    touch: onChange,
  };
}

export type Database = ReturnType<typeof createDatabase>;
