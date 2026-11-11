import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { ErrorBoundary } from '@/shared/ui';

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  /** Phones show one pane at a time: the list, or the open conversation. */
  hasSelection: boolean;
}

/**
 * Responsive two-pane layout. Mobile: one pane. Tablet: 320 px sidebar + chat.
 * Desktop: 360 px sidebar + chat. Each pane has its own error boundary.
 */
export function AppShell({ sidebar, children, hasSelection }: AppShellProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-bg">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-fg focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to conversation
      </a>
      <nav
        aria-label="Conversations"
        className={cn(
          'w-full shrink-0 flex-col border-r border-border bg-surface md:flex md:w-80 xl:w-90',
          hasSelection ? 'hidden' : 'flex',
        )}
      >
        <ErrorBoundary title="Couldn't load your chats" className="h-full">
          {sidebar}
        </ErrorBoundary>
      </nav>
      <main
        id="main"
        tabIndex={-1}
        className={cn('min-w-0 flex-1 flex-col', hasSelection ? 'flex' : 'hidden md:flex')}
      >
        <ErrorBoundary className="h-full">{children}</ErrorBoundary>
      </main>
    </div>
  );
}
