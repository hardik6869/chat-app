import { useShallow } from 'zustand/react/shallow';
import { getConversationTitle, getPartnerId, isGroup, presenceText } from '@/entities';
import { useChatStore } from '@/store';

interface ConversationHeader {
  title: string;
  subtitle: string;
  avatarUrl?: string;
  isOnline: boolean;
}

/** Title, avatar and presence line for a conversation, or undefined if it doesn't exist. */
export function useConversationHeader(conversationId: string): ConversationHeader | undefined {
  return useChatStore(
    useShallow((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return undefined;
      const title = getConversationTitle(conversation, state.users, state.currentUserId);

      if (isGroup(conversation)) {
        const online = conversation.memberIds.filter((id) => state.users[id]?.isOnline).length;
        return {
          title,
          avatarUrl: conversation.avatarUrl,
          isOnline: false,
          subtitle: `${conversation.memberIds.length} members, ${online} online`,
        };
      }

      const partner = state.users[getPartnerId(conversation, state.currentUserId)];
      return {
        title,
        avatarUrl: partner?.avatarUrl,
        isOnline: partner?.isOnline ?? false,
        subtitle: presenceText(partner),
      };
    }),
  );
}
