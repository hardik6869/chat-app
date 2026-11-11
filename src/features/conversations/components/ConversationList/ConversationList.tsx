import { MessageCirclePlus } from 'lucide-react';
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

export function ConversationList() {
  const { ids, isLoading } = useConversationIds();

  if (isLoading) return <ConversationListSkeleton />;

  if (ids.length === 0) {
    return (
      <EmptyState
        icon={MessageCirclePlus}
        title="No conversations yet"
        description="New chats will appear here."
      />
    );
  }

  return (
    <ul className="space-y-0.5 p-2">
      {ids.map((id) => (
        <ConversationItem key={id} conversationId={id} />
      ))}
    </ul>
  );
}
