import { MessagesSquare } from 'lucide-react';
import { EmptyState } from '@/shared/ui';

/** Desktop/tablet placeholder shown before a chat is opened. */
export function NoConversationSelected() {
  return (
    <EmptyState
      icon={MessagesSquare}
      title="Select a conversation"
      description="Choose a chat from the list to start messaging."
      className="h-full bg-surface-muted"
    />
  );
}
