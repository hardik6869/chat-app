import { useEffect, useState } from 'react';
import type { Message } from '@/entities';
import { useDebounce } from '@/shared/hooks';
import { captureError } from '@/shared/lib';
import { useChatStore } from '@/store';

const SEARCH_DEBOUNCE_MS = 300;

interface SearchResult {
  query: string;
  messages: Message[];
  failed: boolean;
}

const EMPTY: SearchResult = { query: '', messages: [], failed: false };

/**
 * Debounced server-side search in one conversation. Stale responses are ignored, and
 * "loading" is derived from whether the latest query has an answer yet.
 */
export function useMessageSearch(conversationId: string, query: string) {
  const searchMessages = useChatStore((state) => state.searchMessages);
  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, SEARCH_DEBOUNCE_MS);
  const [result, setResult] = useState<SearchResult>(EMPTY);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!debounced) return;
    let cancelled = false;
    searchMessages(conversationId, debounced).then(
      (messages) => {
        if (!cancelled) setResult({ query: debounced, messages, failed: false });
      },
      (error: unknown) => {
        captureError(error, 'searchMessages');
        if (!cancelled) setResult({ query: debounced, messages: [], failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [conversationId, debounced, searchMessages, attempt]);

  const current = result.query === trimmed ? result : undefined;

  return {
    results: current?.messages ?? [],
    failed: current?.failed ?? false,
    isLoading: trimmed !== '' && current === undefined,
    retry: () => {
      setResult(EMPTY);
      setAttempt((value) => value + 1);
    },
  };
}
