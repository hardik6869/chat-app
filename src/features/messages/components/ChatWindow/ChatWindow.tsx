import { MessageSquareOff } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib';
import { buttonBase, buttonVariants, EmptyState, ErrorBoundary } from '@/shared/ui';
import { useActiveConversation } from '../../hooks';
import { ChatHeader } from '../ChatHeader';

/** One open conversation: header, messages and composer. */
export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { notFound } = useActiveConversation(conversationId);

  if (notFound) {
    return (
      <EmptyState
        icon={MessageSquareOff}
        title="Conversation not found"
        description="It may have been removed, or the link is wrong."
        className="h-full"
        action={
          <Link to="/" className={cn(buttonBase, buttonVariants.secondary, 'h-8 px-3 text-sm')}>
            Back to chats
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversationId={conversationId} />
      <ErrorBoundary title="Couldn't show this conversation" className="flex-1">
        <div className="min-h-0 flex-1 bg-surface-muted" />
      </ErrorBoundary>
    </div>
  );
}
