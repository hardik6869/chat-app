import { useEffect, type RefObject } from 'react';

const KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End']);

/**
 * ↑/↓/Home/End move focus between items (matching `selector`) inside the container.
 * Items stay in the normal Tab order, so this only adds a faster way to move.
 */
export function useArrowNavigation(ref: RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!KEYS.has(event.key)) return;
      const items = [...container.querySelectorAll<HTMLElement>(selector)];
      const index = items.findIndex((item) => item === document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      const last = items.length - 1;
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : event.key === 'ArrowDown'
              ? Math.min(last, index + 1)
              : Math.max(0, index - 1);
      items[next]?.focus();
    };
    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, selector]);
}
