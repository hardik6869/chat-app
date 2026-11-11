import { useEffect } from 'react';
import { useChatStore } from '@/store';

/**
 * Keeps the store's active conversation in sync with the open route, and reports
 * whether it exists once the session has loaded.
 */
export function useActiveConversation(conversationId: string) {
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const isReady = useChatStore((state) => state.bootstrapStatus === 'success');
  const exists = useChatStore((state) => conversationId in state.conversations);

  useEffect(() => {
    if (!isReady || !exists) return;
    setActiveConversation(conversationId);
    return () => {
      setActiveConversation(undefined);
    };
  }, [conversationId, exists, isReady, setActiveConversation]);

  return { isReady, notFound: isReady && !exists };
}
