import { memo } from 'react';
import { NavLink } from 'react-router';
import { cn, formatListTime } from '@/shared/lib';
import { Avatar, Badge } from '@/shared/ui';
import { useConversationSummary } from '../../hooks';

/**
 * 72 px row: avatar (with presence) · name + time · preview + unread badge.
 * Selected row gets an indigo tint and a left accent bar; unread rows are bold.
 */
export const ConversationItem = memo(function ConversationItem({
  conversationId,
}: {
  conversationId: string;
}) {
  const summary = useConversationSummary(conversationId);
  if (!summary) return null;
  const unread = summary.unreadCount > 0;

  return (
    <li>
      <NavLink
        to={`/c/${conversationId}`}
        className={({ isActive }) =>
          cn(
            'relative flex h-18 items-center gap-3 rounded-lg px-3 transition-colors',
            isActive
              ? 'bg-surface-active before:absolute before:inset-y-3 before:left-0 before:w-0.75 before:rounded-full before:bg-primary'
              : 'hover:bg-surface-muted',
          )
        }
      >
        <Avatar name={summary.title} src={summary.avatarUrl} online={summary.isOnline} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn('truncate text-sm text-text', unread ? 'font-semibold' : 'font-medium')}
            >
              {summary.title}
            </span>
            {summary.lastActivityAt && (
              <time
                dateTime={summary.lastActivityAt}
                className={cn(
                  'shrink-0 text-xs',
                  unread ? 'font-medium text-primary-text' : 'text-text-muted',
                )}
              >
                {formatListTime(summary.lastActivityAt)}
              </time>
            )}
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p
              className={cn(
                'truncate text-sm',
                summary.isTyping ? 'text-accent' : unread ? 'text-text' : 'text-text-muted',
              )}
            >
              {summary.preview}
            </p>
            <Badge
              count={summary.unreadCount}
              label={`${summary.unreadCount} unread ${summary.unreadCount === 1 ? 'message' : 'messages'}`}
            />
          </div>
        </div>
      </NavLink>
    </li>
  );
});
