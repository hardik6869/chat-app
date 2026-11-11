import { useLayoutEffect, type RefObject } from 'react';

/**
 * Grows a textarea with its content. Cap the height with CSS `max-height`;
 * past that, the textarea scrolls. Works in every browser (unlike `field-sizing`).
 */
export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Empty: use the natural one-row height. (Browsers count a long placeholder in
    // scrollHeight, which would make an empty field tall.)
    if (!value) {
      element.style.height = '';
      return;
    }
    element.style.height = 'auto';
    // scrollHeight excludes borders; add them so a single line never shows a scrollbar.
    const borders = element.offsetHeight - element.clientHeight;
    element.style.height = `${element.scrollHeight + borders}px`;
  }, [ref, value]);
}
