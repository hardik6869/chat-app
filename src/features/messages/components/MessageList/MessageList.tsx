import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageCircle } from 'lucide-react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { EmptyState, ErrorState } from '@/shared/ui';
import { useAutoScroll, useFocusMessage, useLoadOlderMessages, useThread } from '../../hooks';
import { JumpToLatest } from '../JumpToLatest';
import { MessageListSkeleton } from './MessageListSkeleton';
import { OlderMessagesStatus } from './OlderMessagesStatus';
import { ThreadRowView } from './ThreadRowView';

/**
 * Virtualized thread: only visible rows are in the DOM, so 10,000+ messages stay smooth.
 * Rows are measured after render because message heights vary. Older pages load on scroll.
 */
export function MessageList({ conversationId }: { conversationId: string }) {
  const { status, rows, isGroup, retry, hasMore, olderStatus, loadOlder } =
    useThread(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 10,
    // Room below the last message for the floating typing indicator.
    paddingEnd: 48,
    scrollPaddingEnd: 48,
    initialRect: { width: 0, height: 800 },
  });

  const scrollToBottom = useCallback(() => {
    if (rows.length > 0) virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
  }, [rows.length, virtualizer]);

  // Open at the first unread message if there is one, otherwise at the newest.
  useLayoutEffect(() => {
    if (didInitialScroll.current || rows.length === 0) return;
    didInitialScroll.current = true;
    const unreadIndex = rows.findIndex((row) => row.type === 'unread');
    if (unreadIndex > 0) virtualizer.scrollToIndex(unreadIndex, { align: 'start' });
    else scrollToBottom();
  }, [rows, scrollToBottom, virtualizer]);

  const ready = status === 'success' && rows.length > 0;
  const { atBottom, unseenCount } = useAutoScroll({
    scrollRef,
    rows,
    scrollToBottom,
    enabled: ready,
  });
  useLoadOlderMessages({
    scrollRef,
    virtualizer,
    rows,
    canLoad: hasMore && olderStatus !== 'loading',
    loadOlder,
    enabled: ready,
  });
  useFocusMessage({ virtualizer, rows, hasMore, olderStatus, loadOlder });

  if (status === 'error') {
    return <ErrorState title="Couldn't load messages" onRetry={retry} className="h-full" />;
  }
  if (status !== 'success') return <MessageListSkeleton />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="Say hello and start the conversation 👋"
        className="h-full"
      />
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Messages"
        tabIndex={0}
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div
          role="list"
          className="relative mx-auto w-full max-w-220"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((item) => {
            const row = rows[item.index];
            if (!row) return null;
            return (
              <div
                key={item.key}
                ref={virtualizer.measureElement}
                data-index={item.index}
                role="listitem"
                aria-setsize={rows.length}
                aria-posinset={item.index + 1}
                className="absolute top-0 left-0 w-full px-3 md:px-6"
                style={{ transform: `translateY(${item.start}px)` }}
              >
                <ThreadRowView row={row} isGroup={isGroup} />
              </div>
            );
          })}
        </div>
      </div>
      <OlderMessagesStatus status={olderStatus} onRetry={loadOlder} />
      {!atBottom && <JumpToLatest unseenCount={unseenCount} onClick={scrollToBottom} />}
    </div>
  );
}
