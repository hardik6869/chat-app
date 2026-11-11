import { useShallow } from 'zustand/react/shallow';
import { selectTypingNames, useChatStore } from '@/store';

const firstName = (name: string) => name.split(' ')[0] ?? name;

/** "Ava is typing…", "Ava and Liam are typing…", "Ava and 2 others are typing…", or null. */
export function formatTyping(names: readonly string[]): string | null {
  const [first, second] = names.map(firstName);
  if (!first) return null;
  if (names.length === 1) return `${first} is typing…`;
  if (names.length === 2) return `${first} and ${second ?? ''} are typing…`;
  return `${first} and ${names.length - 1} others are typing…`;
}

export function useTypingText(conversationId: string): string | null {
  const names = useChatStore(useShallow((state) => selectTypingNames(state, conversationId)));
  return formatTyping(names);
}
