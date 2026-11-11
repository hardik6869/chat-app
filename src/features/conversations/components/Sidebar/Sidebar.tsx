import type { ReactNode } from 'react';
import { Avatar, Skeleton } from '@/shared/ui';
import { useCurrentUser } from '../../hooks';

/** Sidebar frame: 64 px header aligned with the chat header, then scrollable content. */
export function Sidebar({ children }: { children?: ReactNode }) {
  const currentUser = useCurrentUser();

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        {currentUser ? (
          <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
        ) : (
          <Skeleton className="size-10 rounded-full" />
        )}
        <h1 className="flex-1 text-lg font-semibold text-text">Chats</h1>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
