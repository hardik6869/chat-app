import { Ban, CircleAlert } from 'lucide-react';
import { memo } from 'react';
import { MessageStatusIcon } from '@/entities';
import { cn, formatTime } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import { useMessage } from '../../hooks';

interface MessageBubbleProps {
  messageId: string;
  isOwn: boolean;
  isFirstInGroup: boolean;
  /** Group chats show the sender's avatar and name on others' messages. */
  showSender: boolean;
}

/** Mine: right, indigo. Theirs: left, card. Grouped messages sit 2 px apart, groups 12 px. */
export const MessageBubble = memo(function MessageBubble({
  messageId,
  isOwn,
  isFirstInGroup,
  showSender,
}: MessageBubbleProps) {
  const { message, sender, retry } = useMessage(messageId);
  if (!message) return null;
  const deleted = message.deletedAt !== undefined;
  const withSender = showSender && !isOwn;
  const failed = isOwn && message.status === 'failed';

  return (
    <div
      className={cn(
        'flex items-start gap-2',
        isOwn ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-3' : 'mt-0.5',
      )}
    >
      {withSender &&
        (isFirstInGroup ? (
          <Avatar name={sender.name} src={sender.avatarUrl} size="sm" />
        ) : (
          <span aria-hidden className="w-8 shrink-0" />
        ))}
      <div
        className={cn(
          'flex max-w-[85%] min-w-0 flex-col gap-1 md:max-w-[75%]',
          isOwn ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'max-w-full min-w-16 rounded-lg px-3 py-2',
            isOwn ? 'bg-bubble-out text-primary-fg' : 'bg-bubble-in text-text',
            isFirstInGroup && (isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'),
          )}
        >
          {withSender && isFirstInGroup && (
            <p className="mb-0.5 text-xs font-semibold text-primary-text">{sender.name}</p>
          )}
          {deleted ? (
            <p className="flex items-center gap-1.5 text-sm italic">
              <Ban aria-hidden className="size-4" />
              This message was deleted
            </p>
          ) : (
            <p className="text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap">
              {message.text}
            </p>
          )}
          <p
            className={cn(
              'mt-1 flex items-center justify-end gap-1 text-xs',
              isOwn ? 'text-bubble-out-meta' : 'text-text-muted',
            )}
          >
            {message.editedAt && !deleted && <span>edited</span>}
            <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            {isOwn && !deleted && !failed && (
              <MessageStatusIcon status={message.status} tone="bubble" />
            )}
          </p>
        </div>
        {failed && (
          <p className="flex items-center gap-1 text-xs text-danger">
            <CircleAlert aria-hidden className="size-4" />
            Not sent
            <button type="button" onClick={retry} className="rounded-sm font-semibold underline">
              Retry
            </button>
          </p>
        )}
      </div>
    </div>
  );
});
