import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib';
import { Avatar, buttonBase, buttonVariants, Skeleton } from '@/shared/ui';
import { useConversationHeader } from '../../hooks';

interface ChatHeaderProps {
  conversationId: string;
  /** Buttons on the right (search, group info). */
  actions?: ReactNode;
}

/** 64 px header: back link (mobile only), avatar, title, presence/members line and actions. */
export function ChatHeader({ conversationId, actions }: ChatHeaderProps) {
  const header = useConversationHeader(conversationId);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-2 md:px-4">
      <Link
        to="/"
        aria-label="Back to conversations"
        className={cn(buttonBase, buttonVariants.ghost, 'size-10 rounded-full md:hidden')}
      >
        <ArrowLeft aria-hidden className="size-5" />
      </Link>
      {header ? (
        <>
          <Avatar name={header.title} src={header.avatarUrl} online={header.isOnline} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-text">{header.title}</h2>
            <p className="truncate text-xs text-text-muted">{header.subtitle}</p>
          </div>
        </>
      ) : (
        <Skeleton className="h-10 w-48" />
      )}
      {actions}
    </header>
  );
}
