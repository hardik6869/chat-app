import { useCallback } from 'react';
import { useChatStore } from '@/store';

/** Actions offered on one message. */
export function useMessageActions(messageId: string) {
  const conversationId = useChatStore((state) => state.messages[messageId]?.conversationId);
  const setComposerTarget = useChatStore((state) => state.setComposerTarget);

  const reply = useCallback(() => {
    if (conversationId) setComposerTarget(conversationId, { mode: 'reply', messageId });
  }, [conversationId, messageId, setComposerTarget]);

  return { reply };
}
