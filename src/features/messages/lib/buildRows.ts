import type { Message } from '@/entities';

/** Consecutive messages from one sender within this window are shown as one group. */
const GROUP_WINDOW_MS = 5 * 60_000;

export type ThreadRow =
  | { type: 'start'; key: string }
  | { type: 'unread'; key: string; count: number }
  | { type: 'date'; key: string; date: string }
  | {
      type: 'message';
      key: string;
      messageId: string;
      isOwn: boolean;
      isFirstInGroup: boolean;
    };

const dayOf = (iso: string) => new Date(iso).toDateString();

function sameGroup(a: Message | undefined, b: Message) {
  if (!a) return false;
  return (
    a.senderId === b.senderId &&
    dayOf(a.createdAt) === dayOf(b.createdAt) &&
    Math.abs(Date.parse(b.createdAt) - Date.parse(a.createdAt)) <= GROUP_WINDOW_MS
  );
}

/**
 * Flattens messages (oldest first) into rows with date separators, grouping flags and,
 * when `unreadCount` > 0, an "unread" divider before the first unread message.
 */
export function buildRows(
  messages: readonly Message[],
  currentUserId: string,
  unreadCount = 0,
): ThreadRow[] {
  const rows: ThreadRow[] = [];
  const firstUnread = unreadCount > 0 ? Math.max(0, messages.length - unreadCount) : -1;

  messages.forEach((message, index) => {
    const previous = messages[index - 1];

    if (!previous || dayOf(previous.createdAt) !== dayOf(message.createdAt)) {
      rows.push({ type: 'date', key: `date-${dayOf(message.createdAt)}`, date: message.createdAt });
    }

    if (index === firstUnread) {
      rows.push({ type: 'unread', key: 'unread-divider', count: unreadCount });
    }

    rows.push({
      type: 'message',
      key: message.id,
      messageId: message.id,
      isOwn: message.senderId === currentUserId,
      isFirstInGroup: !sameGroup(previous, message),
    });
  });

  return rows;
}
