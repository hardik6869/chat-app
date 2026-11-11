import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffect, useEffectEvent, useLayoutEffect, useRef, type RefObject } from 'react';
import type { ThreadRow } from '../lib';

/** Start loading the previous page this close to the top. */
const TOP_THRESHOLD_PX = 200;

interface LoadOlderOptions {
  scrollRef: RefObject<HTMLElement | null>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  rows: readonly ThreadRow[];
  canLoad: boolean;
  loadOlder: () => void;
  enabled: boolean;
}

/**
 * Infinite scroll upwards. Near the top it loads the previous page, then keeps the first
 * visible message exactly where it was, so the view doesn't jump when rows are prepended.
 */
export function useLoadOlderMessages({
  scrollRef,
  virtualizer,
  rows,
  canLoad,
  loadOlder,
  enabled,
}: LoadOlderOptions) {
  /** First visible row and its distance from the top of the viewport, before loading. */
  const anchorRef = useRef<{ key: string; offset: number } | null>(null);

  const handleScroll = useEffectEvent(() => {
    const element = scrollRef.current;
    if (!element || !canLoad || element.scrollTop > TOP_THRESHOLD_PX) return;
    const scrollTop = virtualizer.scrollOffset ?? element.scrollTop;
    // Anchor to a message: date separators move when older messages from the same day arrive.
    const firstVisible = virtualizer
      .getVirtualItems()
      .find((item) => item.end > scrollTop && rows[item.index]?.type === 'message');
    if (firstVisible) {
      anchorRef.current = { key: String(firstVisible.key), offset: firstVisible.start - scrollTop };
    }
    loadOlder();
  });

  useEffect(() => {
    const element = scrollRef.current;
    if (!enabled || !element) return;
    const listener = () => {
      handleScroll();
    };
    element.addEventListener('scroll', listener, { passive: true });
    return () => {
      element.removeEventListener('scroll', listener);
    };
  }, [enabled, scrollRef]);

  // After older rows are prepended, put the anchor row back where it was.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const index = rows.findIndex((row) => row.key === anchor.key);
    if (index <= 0) return;
    anchorRef.current = null;
    const start = virtualizer.getOffsetForIndex(index, 'start')?.[0];
    if (start !== undefined) virtualizer.scrollToOffset(start - anchor.offset);
  }, [rows, virtualizer]);
}
