import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store';

/**
 * Keeps the store's active conversation in sync with the open route, and reports
 * whether it exists once the session has loaded.
 */
export function useActiveConversation(conversationId: string) {
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const isReady = useChatStore((state) => state.bootstrapStatus === 'success');
  const exists = useChatStore((state) => conversationId in state.conversations);
  // Unread count when this chat was opened. A ref survives effect re-runs (StrictMode,
  // reconnects), so the "unread" divider keeps its place after messages are marked read.
  const unreadOnOpen = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isReady || !exists) return;
    unreadOnOpen.current ??=
      useChatStore.getState().conversations[conversationId]?.unreadCount ?? 0;
    setActiveConversation(conversationId, unreadOnOpen.current);
    return () => {
      setActiveConversation(undefined);
    };
  }, [conversationId, exists, isReady, setActiveConversation]);

  return { isReady, notFound: isReady && !exists };
}
