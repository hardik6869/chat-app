import { useRef, useState } from 'react';
import { useDebounce, useKeyboardShortcut } from '@/shared/hooks';
import type { ConversationFilter } from '@/store';

const SEARCH_DEBOUNCE_MS = 250;

/** Search text (debounced for filtering), the active filter chip and the Ctrl/⌘+K shortcut. */
export function useConversationFilters() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const searchRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcut('mod+k', () => {
    searchRef.current?.focus();
    searchRef.current?.select();
  });

  return { query, setQuery, debouncedQuery, filter, setFilter, searchRef };
}
