import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store';

/** Sender and a text snippet of the message being replied to. */
export function useQuotedMessage(messageId: string) {
  return useChatStore(
    useShallow((state) => {
      const message = state.messages[messageId];
      const sender =
        message?.senderId === state.currentUserId
          ? 'You'
          : (state.users[message?.senderId ?? '']?.name ?? 'Unknown user');
      const text = !message
        ? 'Original message'
        : message.deletedAt
          ? 'This message was deleted'
          : message.text;
      return { sender, text };
    }),
  );
}
