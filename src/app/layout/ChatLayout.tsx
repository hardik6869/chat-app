import { Outlet, useParams } from 'react-router';
import { Sidebar } from '@/features/conversations';
import { ThemeToggle } from '@/features/theme';
import { ErrorState } from '@/shared/ui';
import { useChatSession } from '../hooks';
import { AppShell } from './AppShell';

/** Root route: starts the session and lays out sidebar + routed chat. */
export function ChatLayout() {
  const { conversationId } = useParams();
  const { isError, retry } = useChatSession();

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
    <AppShell
      sidebar={<Sidebar actions={<ThemeToggle />} />}
      hasSelection={conversationId !== undefined}
    >
      <Outlet />
    </AppShell>
  );
}
