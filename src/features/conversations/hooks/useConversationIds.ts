import { useShallow } from 'zustand/react/shallow';
import { selectConversationList, useChatStore, type ConversationFilter } from '@/store';

/**
 * Ordered ids of the visible conversations. Subscribing to ids only means the list
 * re-renders when order or membership changes, not on every message.
 */
export function useConversationIds(filter: ConversationFilter = 'all', query = '') {
  const ids = useChatStore(
    useShallow((state) => selectConversationList(state, filter, query).map(({ id }) => id)),
  );
  const isLoading = useChatStore((state) => state.bootstrapStatus !== 'success');

  return { ids, isLoading };
}
