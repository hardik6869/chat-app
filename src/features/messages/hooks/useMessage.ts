import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store';

/** One message plus its sender's display info. Re-renders only when this message changes. */
export function useMessage(messageId: string) {
  const message = useChatStore((state) => state.messages[messageId]);
  const retryMessage = useChatStore((state) => state.retryMessage);
  const sender = useChatStore(
    useShallow((state) => {
      const user = state.users[message?.senderId ?? ''];
      return { name: user?.name ?? 'Unknown user', avatarUrl: user?.avatarUrl };
    }),
  );
  const retry = useCallback(() => {
    void retryMessage(messageId);
  }, [messageId, retryMessage]);

  return { message, sender, retry };
}
