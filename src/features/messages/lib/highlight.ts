/** Splits text into plain and matching parts (case-insensitive) for highlighting. */
export function splitMatches(text: string, query: string): { text: string; match: boolean }[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [{ text, match: false }];

  const parts: { text: string; match: boolean }[] = [];
  const haystack = text.toLowerCase();
  let cursor = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), match: false });
    parts.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}
