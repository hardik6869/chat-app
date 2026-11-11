import { useEffect, useState, type RefObject } from 'react';
import { useClickOutside } from '@/shared/hooks';

/**
 * Touch screens have no hover: a long-press (which fires `contextmenu`) opens the
 * message's action pill; pressing anywhere else closes it.
 */
export function useLongPressMenu(ref: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleContextMenu = (event: Event) => {
      event.preventDefault();
      setOpen(true);
    };
    element.addEventListener('contextmenu', handleContextMenu);
    return () => {
      element.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [ref]);

  useClickOutside(
    ref,
    () => {
      setOpen(false);
    },
    open,
  );

  return open;
}
