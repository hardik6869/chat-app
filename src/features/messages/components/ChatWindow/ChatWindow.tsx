import { MessageSquareOff, Search } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib';
import { useKeyboardShortcut } from '@/shared/hooks';
import { buttonBase, buttonVariants, EmptyState, ErrorBoundary, IconButton } from '@/shared/ui';
import { useActiveConversation } from '../../hooks';
import { ChatHeader } from '../ChatHeader';
import { Composer } from '../Composer';
import { DeleteMessageDialog } from '../DeleteMessageDialog';
import { MessageList } from '../MessageList';
import { MessageSearch } from '../MessageSearch';
import { TypingIndicator } from '../TypingIndicator';

interface ChatWindowProps {
  conversationId: string;
  /** Extra header buttons supplied by the app (e.g. group info). */
  headerActions?: ReactNode;
  /** Side content supplied by the app (e.g. the group info panel). */
  aside?: ReactNode;
}

/** One open conversation: header, messages and composer, plus optional side panel. */
export function ChatWindow({ conversationId, headerActions, aside }: ChatWindowProps) {
  const { notFound } = useActiveConversation(conversationId);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useKeyboardShortcut('mod+f', () => {
    setSearchOpen(true);
  });

  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };

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
    <div className="relative flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          conversationId={conversationId}
          actions={
            <>
              <IconButton
                ref={searchButtonRef}
                icon={Search}
                label="Search messages"
                aria-keyshortcuts="Control+F Meta+F"
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen((open) => !open);
                }}
              />
              {headerActions}
            </>
          }
        />
        <ErrorBoundary title="Couldn't show this conversation" className="flex-1">
          <div className="relative min-h-0 flex-1 bg-surface-muted">
            <MessageList conversationId={conversationId} />
            <TypingIndicator conversationId={conversationId} />
            {searchOpen && <MessageSearch conversationId={conversationId} onClose={closeSearch} />}
          </div>
          <Composer conversationId={conversationId} />
          <DeleteMessageDialog />
        </ErrorBoundary>
      </div>
      {aside}
    </div>
  );
}
