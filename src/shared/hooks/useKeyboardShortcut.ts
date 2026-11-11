import { useEffect, useEffectEvent } from 'react';

interface ShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * True when the event matches a shortcut like `mod+k`, `shift+enter` or `escape`.
 * `mod` is Ctrl on Windows/Linux and ⌘ on macOS.
 */
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts.at(-1);
  const modifiers = new Set(parts.slice(0, -1));
  const commandMatches = modifiers.has('mod')
    ? event.ctrlKey || event.metaKey
    : modifiers.has('ctrl') === event.ctrlKey && modifiers.has('meta') === event.metaKey;

  return (
    event.key.toLowerCase() === key &&
    commandMatches &&
    modifiers.has('shift') === event.shiftKey &&
    modifiers.has('alt') === event.altKey
  );
}

/** Runs `onTrigger` when the shortcut is pressed anywhere in the window. */
export function useKeyboardShortcut(
  shortcut: string,
  onTrigger: (event: KeyboardEvent) => void,
  { enabled = true, preventDefault = true }: ShortcutOptions = {},
): void {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || !matchesShortcut(event, shortcut)) return;
    if (preventDefault) event.preventDefault();
    onTrigger(event);
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [enabled]);
}
