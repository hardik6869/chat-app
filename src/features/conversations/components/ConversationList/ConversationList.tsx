import { CheckCheck, MessageCirclePlus, SearchX, Users } from 'lucide-react';
import type { ConversationFilter } from '@/store';
import { EmptyState, Skeleton } from '@/shared/ui';
import { useConversationIds } from '../../hooks';
import { ConversationItem } from '../ConversationItem';

const SKELETON_ROWS = 6;

function ConversationListSkeleton() {
  return (
    <div role="status" aria-label="Loading conversations" className="space-y-1 p-2">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="flex h-18 items-center gap-3 px-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoResults({ filter, query }: { filter: ConversationFilter; query: string }) {
  if (query) {
    return (
      <EmptyState
        icon={SearchX}
        title="No matches"
        description={`Nothing found for "${query}". Try a name or a word from a message.`}
      />
    );
  }
  if (filter === 'unread') {
    return (
      <EmptyState
        icon={CheckCheck}
        title="You're all caught up"
        description="No unread messages."
      />
    );
  }
  if (filter === 'groups') {
    return (
      <EmptyState icon={Users} title="No groups yet" description="Group chats will appear here." />
    );
  }
  return (
    <EmptyState
      icon={MessageCirclePlus}
      title="No conversations yet"
      description="New chats will appear here."
    />
  );
}

interface ConversationListProps {
  filter?: ConversationFilter;
  query?: string;
}

export function ConversationList({ filter = 'all', query = '' }: ConversationListProps) {
  const { ids, isLoading } = useConversationIds(filter, query);
  const isFiltered = filter !== 'all' || query.trim() !== '';

  if (isLoading) return <ConversationListSkeleton />;

  return (
    <>
      {/* Announces result counts to screen readers when searching or filtering (WCAG 4.1.3). */}
      <p role="status" className="sr-only">
        {isFiltered
          ? `${ids.length} ${ids.length === 1 ? 'conversation' : 'conversations'} found`
          : ''}
      </p>
      {ids.length === 0 ? (
        <NoResults filter={filter} query={query.trim()} />
      ) : (
        <ul className="space-y-0.5 p-2">
          {ids.map((id) => (
            <ConversationItem key={id} conversationId={id} />
          ))}
        </ul>
      )}
    </>
  );
}
