import { Copy, Pencil, Reply, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import { IconButton } from '@/shared/ui';
import { useMessageActions } from '../../hooks';

interface MessageActionsProps {
  messageId: string;
  className?: string;
}

/**
 * Compact action pill. It's hidden until the message is hovered, long-pressed or anything
 * inside gets keyboard focus, so it stays reachable with Tab while keeping the thread clean.
 */
export function MessageActions({ messageId, className }: MessageActionsProps) {
  const { reply, edit, copy, requestDelete, canCopy, canEdit, canDelete } =
    useMessageActions(messageId);

  return (
    <div
      role="toolbar"
      aria-label="Message actions"
      className={cn(
        'flex shrink-0 items-center gap-0.5 self-center rounded-full border border-border bg-surface p-0.5 shadow-sm',
        'opacity-0 transition-opacity group-hover:opacity-100 group-data-[actions=open]:opacity-100 focus-within:opacity-100',
        className,
      )}
    >
      <IconButton icon={Reply} label="Reply" size="sm" onClick={reply} />
      {canCopy && (
        <IconButton
          icon={Copy}
          label="Copy text"
          size="sm"
          onClick={() => {
            void copy();
          }}
        />
      )}
      {canEdit && <IconButton icon={Pencil} label="Edit" size="sm" onClick={edit} />}
      {canDelete && <IconButton icon={Trash2} label="Delete" size="sm" onClick={requestDelete} />}
    </div>
  );
}
