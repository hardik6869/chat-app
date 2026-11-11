import { Outlet, useParams } from 'react-router';
import { Sidebar } from '@/features/conversations';
import { ThemeToggle } from '@/features/theme';
import { ErrorState } from '@/shared/ui';
import { useChatSession, useUnreadTitle } from '../hooks';
import { AppShell } from './AppShell';
import { OfflineBanner } from './OfflineBanner';

/** Root route: starts the session and lays out sidebar + routed chat. */
export function ChatLayout() {
  const { conversationId } = useParams();
  const { isError, retry } = useChatSession();
  useUnreadTitle();

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your chats"
        onRetry={() => {
          void retry();
        }}
        className="h-dvh"
      />
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <OfflineBanner />
      <AppShell
        sidebar={<Sidebar actions={<ThemeToggle />} />}
        hasSelection={conversationId !== undefined}
      >
        <Outlet />
      </AppShell>
    </div>
  );
}
