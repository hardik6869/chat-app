import { getConversationTitle, isGroup, type Conversation, type Message } from '@/entities';
import type { ChatState } from './types';

export type ConversationFilter = 'all' | 'unread' | 'groups';

const activityTime = (conversation: Conversation) =>
  conversation.lastMessage?.createdAt ?? conversation.createdAt;

/** Conversations matching the filter and search, most recent activity first. */
export function selectConversationList(
  state: ChatState,
  filter: ConversationFilter,
  query: string,
): Conversation[] {
  const needle = query.trim().toLowerCase();
  return Object.values(state.conversations)
    .filter((conversation) => {
      if (filter === 'unread' && conversation.unreadCount === 0) return false;
      if (filter === 'groups' && !isGroup(conversation)) return false;
      if (!needle) return true;
      const title = getConversationTitle(conversation, state.users, state.currentUserId);
      return (
        title.toLowerCase().includes(needle) ||
        (conversation.lastMessage?.text.toLowerCase().includes(needle) ?? false)
      );
    })
    .sort((a, b) => activityTime(b).localeCompare(activityTime(a)));
}

/** Loaded messages of a conversation, oldest first. */
export function selectThreadMessages(state: ChatState, conversationId: string): Message[] {
  const ids = state.threads[conversationId]?.ids ?? [];
  return ids.flatMap((id) => state.messages[id] ?? []);
}

export function selectTotalUnread(state: ChatState): number {
  return Object.values(state.conversations).reduce((sum, item) => sum + item.unreadCount, 0);
}

/** Names of people typing in a conversation, excluding the current user. */
export function selectTypingNames(state: ChatState, conversationId: string): string[] {
  return (state.typing[conversationId] ?? [])
    .filter((id) => id !== state.currentUserId)
    .map((id) => state.users[id]?.name ?? 'Someone');
}
