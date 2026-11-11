import { useEffect, useEffectEvent, type RefObject } from 'react';

/** Calls `onOutside` when the user presses anywhere outside `ref` (menus, popovers). */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
): void {
  const handlePointerDown = useEffectEvent((event: Event) => {
    const element = ref.current;
    if (element && event.target instanceof Node && !element.contains(event.target)) {
      onOutside();
    }
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: Event) => {
      handlePointerDown(event);
    };
    document.addEventListener('pointerdown', listener);
    return () => {
      document.removeEventListener('pointerdown', listener);
    };
  }, [enabled]);
}
