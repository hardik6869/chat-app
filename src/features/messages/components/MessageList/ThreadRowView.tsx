import type { ThreadRow } from '../../lib';
import { DateSeparator } from '../DateSeparator';
import { MessageBubble } from '../MessageBubble';

/** Renders one virtual row: the conversation start marker, a date pill or a message. */
export function ThreadRowView({ row, isGroup }: { row: ThreadRow; isGroup: boolean }) {
  switch (row.type) {
    case 'start':
      return (
        <p className="pt-6 pb-2 text-center text-xs text-text-muted">Start of the conversation</p>
      );
    case 'date':
      return <DateSeparator date={row.date} />;
    case 'unread':
      return (
        <p className="flex items-center gap-3 pt-4 pb-1 text-xs font-semibold text-primary-text">
          <span aria-hidden className="h-px flex-1 bg-primary" />
          {row.count} unread {row.count === 1 ? 'message' : 'messages'}
          <span aria-hidden className="h-px flex-1 bg-primary" />
        </p>
      );
    case 'message':
      return (
        <MessageBubble
          messageId={row.messageId}
          isOwn={row.isOwn}
          isFirstInGroup={row.isFirstInGroup}
          showSender={isGroup}
        />
      );
  }
}
