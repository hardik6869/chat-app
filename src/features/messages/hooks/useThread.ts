import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isGroup } from '@/entities';
import { selectThreadMessages, useChatStore } from '@/store';
import { buildRows, type ThreadRow } from '../lib';

const START_ROW: ThreadRow = { type: 'start', key: 'thread-start' };

/**
 * Rows to render for a conversation (start marker, date separators, grouped messages)
 * plus load state for the latest page and for older pages.
 */
export function useThread(conversationId: string) {
  const { status, hasMore, olderStatus } = useChatStore(
    useShallow((state) => {
      const thread = state.threads[conversationId];
      return {
        status: thread?.status ?? 'idle',
        hasMore: thread?.hasMore ?? false,
        olderStatus: thread?.olderStatus ?? 'idle',
      };
    }),
  );
  const currentUserId = useChatStore((state) => state.currentUserId);
  const unreadMarker = useChatStore((state) => state.unreadMarkers[conversationId]);
  const group = useChatStore((state) => {
    const conversation = state.conversations[conversationId];
    return conversation ? isGroup(conversation) : false;
  });
  const messages = useChatStore(useShallow((state) => selectThreadMessages(state, conversationId)));
  const loadMessages = useChatStore((state) => state.loadMessages);
  const loadOlderMessages = useChatStore((state) => state.loadOlderMessages);

  const rows = useMemo(() => {
    const built = buildRows(messages, currentUserId, unreadMarker);
    // Once everything is loaded, mark the beginning of the conversation.
    return hasMore || built.length === 0 ? built : [START_ROW, ...built];
  }, [messages, currentUserId, unreadMarker, hasMore]);

  const retry = useCallback(() => {
    void loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  const loadOlder = useCallback(() => {
    void loadOlderMessages(conversationId);
  }, [conversationId, loadOlderMessages]);

  return { status, rows, isGroup: group, retry, hasMore, olderStatus, loadOlder };
}
