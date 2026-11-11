import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageCircle } from 'lucide-react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui';
import { useAutoScroll, useThread } from '../../hooks';
import { DateSeparator } from '../DateSeparator';
import { JumpToLatest } from '../JumpToLatest';
import { MessageBubble } from '../MessageBubble';

function MessageListSkeleton() {
  const widths = ['w-2/5', 'w-1/3', 'w-1/2', 'w-1/4', 'w-2/5'];
  return (
    <div
      role="status"
      aria-label="Loading messages"
      className="mx-auto w-full max-w-220 space-y-3 p-6"
    >
      {widths.map((width, index) => (
        <div key={index} className={index % 2 ? 'flex justify-end' : 'flex'}>
          <Skeleton className={`h-12 ${width} rounded-lg bg-surface`} />
        </div>
      ))}
    </div>
  );
}

/**
 * Virtualized thread: only visible rows are in the DOM, so 10,000+ messages stay smooth.
 * Rows are measured after render because message heights vary.
 */
export function MessageList({ conversationId }: { conversationId: string }) {
  const { status, rows, isGroup, retry } = useThread(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 10,
    paddingEnd: 16,
    scrollPaddingEnd: 16,
    initialRect: { width: 0, height: 800 },
  });

  const scrollToBottom = useCallback(() => {
    if (rows.length > 0) virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
  }, [rows.length, virtualizer]);

  // Open at the newest message.
  useLayoutEffect(() => {
    if (didInitialScroll.current || rows.length === 0) return;
    didInitialScroll.current = true;
    scrollToBottom();
  }, [rows.length, scrollToBottom]);

  const ready = status === 'success' && rows.length > 0;
  const { atBottom, unseenCount } = useAutoScroll({
    scrollRef,
    rows,
    scrollToBottom,
    enabled: ready,
  });

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
                {row.type === 'date' ? (
                  <DateSeparator date={row.date} />
                ) : (
                  <MessageBubble
                    messageId={row.messageId}
                    isOwn={row.isOwn}
                    isFirstInGroup={row.isFirstInGroup}
                    showSender={isGroup}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {!atBottom && <JumpToLatest unseenCount={unseenCount} onClick={scrollToBottom} />}
    </div>
  );
}
