import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isGroup } from '@/entities';
import { selectThreadMessages, useChatStore } from '@/store';
import { buildRows } from '../lib';

/** Rows to render for a conversation (date separators + grouped messages) and load state. */
export function useThread(conversationId: string) {
  const status = useChatStore((state) => state.threads[conversationId]?.status ?? 'idle');
  const currentUserId = useChatStore((state) => state.currentUserId);
  const group = useChatStore((state) => {
    const conversation = state.conversations[conversationId];
    return conversation ? isGroup(conversation) : false;
  });
  const messages = useChatStore(useShallow((state) => selectThreadMessages(state, conversationId)));
  const loadMessages = useChatStore((state) => state.loadMessages);

  const rows = useMemo(() => buildRows(messages, currentUserId), [messages, currentUserId]);
  const retry = useCallback(() => {
    void loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  return { status, rows, isGroup: group, retry };
}
