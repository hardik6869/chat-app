/** Quick reactions offered in the picker, with names for screen readers. */
export const QUICK_REACTIONS = [
  { emoji: '👍', name: 'Thumbs up' },
  { emoji: '❤️', name: 'Heart' },
  { emoji: '😂', name: 'Laughing' },
  { emoji: '🎉', name: 'Party' },
  { emoji: '😮', name: 'Surprised' },
  { emoji: '🙏', name: 'Thank you' },
] as const;

/** "Ava Patel", "Ava Patel and you", "Ava Patel, Liam Chen and you". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1) ?? ''}`;
}
