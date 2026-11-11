import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffect } from 'react';
import type { LoadStatus } from '@/store';
import { useChatStore } from '@/store';
import type { ThreadRow } from '../lib';

/** How long a jumped-to message stays highlighted. */
const HIGHLIGHT_MS = 2500;

interface FocusMessageOptions {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  rows: readonly ThreadRow[];
  hasMore: boolean;
  olderStatus: LoadStatus;
  loadOlder: () => void;
}

/**
 * Jumps to the focused message (e.g. a search result). If it isn't loaded yet, older pages
 * are fetched until it is; then it's centered and highlighted briefly.
 */
export function useFocusMessage({
  virtualizer,
  rows,
  hasMore,
  olderStatus,
  loadOlder,
}: FocusMessageOptions) {
  const focusedId = useChatStore((state) => state.focusedMessageId);
  const focusMessage = useChatStore((state) => state.focusMessage);

  useEffect(() => {
    if (!focusedId) return;
    const index = rows.findIndex((row) => row.type === 'message' && row.messageId === focusedId);
    if (index >= 0) {
      virtualizer.scrollToIndex(index, { align: 'center' });
      const timer = window.setTimeout(() => {
        focusMessage(undefined);
      }, HIGHLIGHT_MS);
      return () => {
        window.clearTimeout(timer);
      };
    }
    if (!hasMore || olderStatus === 'error') focusMessage(undefined);
    else if (olderStatus !== 'loading') loadOlder();
  }, [focusedId, rows, hasMore, olderStatus, loadOlder, focusMessage, virtualizer]);
}
