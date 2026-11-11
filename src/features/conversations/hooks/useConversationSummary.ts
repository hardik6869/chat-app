import { useShallow } from 'zustand/react/shallow';
import {
  getConversationTitle,
  getPartnerId,
  isGroup,
  type Message,
  type MessageStatus,
} from '@/entities';
import { selectTypingNames, useChatStore } from '@/store';

interface ConversationSummary {
  title: string;
  avatarUrl?: string;
  isOnline: boolean;
  preview: string;
  isTyping: boolean;
  /** Delivery state when the last message is mine. */
  lastStatus?: MessageStatus;
  lastActivityAt?: string;
  unreadCount: number;
}

const firstName = (name: string) => name.split(' ')[0] ?? name;

function previewText(message: Message | undefined, sender: string | undefined, prefix: boolean) {
  if (!message) return 'No messages yet';
  if (message.deletedAt) return 'This message was deleted';
  const files = message.attachments ?? [];
  const text =
    message.text ||
    (files.length > 1 ? `📎 ${files.length} attachments` : `📎 ${files[0]?.name ?? 'Attachment'}`);
  return prefix && sender ? `${sender}: ${text}` : text;
}

/** Everything one conversation row shows, as primitives so the row re-renders only on change. */
export function useConversationSummary(conversationId: string): ConversationSummary | undefined {
  return useChatStore(
    useShallow((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return undefined;
      const group = isGroup(conversation);
      const partner = group
        ? undefined
        : state.users[getPartnerId(conversation, state.currentUserId)];
      const last = conversation.lastMessage;
      const typingNames = selectTypingNames(state, conversationId);
      const lastSender =
        last?.senderId === state.currentUserId
          ? 'You'
          : firstName(state.users[last?.senderId ?? '']?.name ?? '');

      return {
        title: getConversationTitle(conversation, state.users, state.currentUserId),
        avatarUrl: group ? conversation.avatarUrl : partner?.avatarUrl,
        isOnline: partner?.isOnline ?? false,
        isTyping: typingNames.length > 0,
        preview:
          typingNames.length > 0
            ? `${group ? `${firstName(typingNames[0] ?? '')} is ` : ''}typing…`
            : previewText(last, lastSender, group || last?.senderId === state.currentUserId),
        lastStatus:
          last?.senderId === state.currentUserId && !last.deletedAt && typingNames.length === 0
            ? last.status
            : undefined,
        lastActivityAt: last?.createdAt,
        unreadCount: conversation.unreadCount,
      };
    }),
  );
}
