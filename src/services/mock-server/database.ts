import type { Conversation, Message, User } from '@/entities';
import { createSeed } from '../mock-data';

/** In-memory "server" storage shared by the mock API and the realtime simulator. */
export function createDatabase(seed = createSeed()) {
  return {
    currentUserId: seed.currentUserId,
    users: new Map<string, User>(seed.users.map((user) => [user.id, user])),
    conversations: new Map<string, Conversation>(
      seed.conversations.map((conversation) => [conversation.id, conversation]),
    ),
    messages: new Map<string, Message[]>(Object.entries(seed.messagesByConversation)),
  };
}

export type Database = ReturnType<typeof createDatabase>;
