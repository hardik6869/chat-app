import { useEffect, useRef, useState, type RefObject } from 'react';
import type { ThreadRow } from '../lib';

/** Within this distance of the bottom counts as "reading the latest messages". */
const NEAR_BOTTOM_PX = 120;

interface AutoScrollOptions {
  scrollRef: RefObject<HTMLElement | null>;
  rows: readonly ThreadRow[];
  scrollToBottom: () => void;
  /** Attach listeners only once the scroll area is rendered. */
  enabled: boolean;
}

/**
 * Follows new messages only when appropriate: always for my own messages, and for incoming
 * ones only if the reader is already at the bottom. Otherwise it counts unseen messages.
 */
export function useAutoScroll({ scrollRef, rows, scrollToBottom, enabled }: AutoScrollOptions) {
  const lastRow = rows.at(-1);
  const lastKeyRef = useRef(lastRow?.key);
  const atBottomRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const [seenKey, setSeenKey] = useState(lastRow?.key);

  useEffect(() => {
    const element = scrollRef.current;
    if (!enabled || !element) return;
    const handleScroll = () => {
      const near = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
      atBottomRef.current = near;
      setAtBottom(near);
      if (near) setSeenKey(lastKeyRef.current);
    };
    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, scrollRef]);

  // React to a new *last* row only; loading older messages at the top doesn't move the view.
  useEffect(() => {
    const previousKey = lastKeyRef.current;
    lastKeyRef.current = lastRow?.key;
    if (!lastRow || previousKey === undefined || previousKey === lastRow.key) return;
    const isOwn = lastRow.type === 'message' && lastRow.isOwn;
    if (isOwn || atBottomRef.current) scrollToBottom();
  }, [lastRow, scrollToBottom]);

  const seenIndex = rows.findIndex((row) => row.key === seenKey);
  const unseenCount = atBottom
    ? 0
    : rows.slice(seenIndex + 1).filter((row) => row.type === 'message' && !row.isOwn).length;

  return { atBottom, unseenCount: seenIndex === -1 ? 0 : unseenCount };
}
