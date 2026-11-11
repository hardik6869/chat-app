import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store';

/** One message plus its sender's display info. Re-renders only when this message changes. */
export function useMessage(messageId: string) {
  const message = useChatStore((state) => state.messages[messageId]);
  const sender = useChatStore(
    useShallow((state) => {
      const user = state.users[message?.senderId ?? ''];
      return { name: user?.name ?? 'Unknown user', avatarUrl: user?.avatarUrl };
    }),
  );
  return { message, sender };
}
