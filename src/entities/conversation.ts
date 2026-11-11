import type { Message } from './message';
import type { UsersById } from './user';

interface BaseConversation {
  id: string;
  /** Includes the current user. */
  memberIds: string[];
  unreadCount: number;
  /** Latest message, kept on the conversation so the list renders without loading every chat. */
  lastMessage?: Message;
  createdAt: string;
}

export interface DirectConversation extends BaseConversation {
  type: 'direct';
}

export interface GroupConversation extends BaseConversation {
  type: 'group';
  name: string;
  description?: string;
  avatarUrl?: string;
  adminIds: string[];
}

export type Conversation = DirectConversation | GroupConversation;

export function isGroup(conversation: Conversation): conversation is GroupConversation {
  return conversation.type === 'group';
}

/** The other person in a direct chat. */
export function getPartnerId(conversation: DirectConversation, currentUserId: string) {
  return conversation.memberIds.find((id) => id !== currentUserId) ?? currentUserId;
}

/** Group name, or the other person's name for direct chats. */
export function getConversationTitle(
  conversation: Conversation,
  users: UsersById,
  currentUserId: string,
): string {
  if (isGroup(conversation)) return conversation.name;
  return users[getPartnerId(conversation, currentUserId)]?.name ?? 'Unknown user';
}
