import { SearchX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useKeyboardShortcut } from '@/shared/hooks';
import { formatListTime } from '@/shared/lib';
import { Button, IconButton, SearchInput, Spinner } from '@/shared/ui';
import { useChatStore } from '@/store';
import { useMessageSearch } from '../../hooks';
import { splitMatches } from '../../lib';

interface MessageSearchProps {
  conversationId: string;
  onClose: () => void;
}

/**
 * Search panel over the thread. First Esc clears the text, the next closes the panel.
 * Picking a result jumps to that message (loading older pages if needed).
 */
export function MessageSearch({ conversationId, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, failed, isLoading, retry } = useMessageSearch(conversationId, query);
  const users = useChatStore((state) => state.users);
  const currentUserId = useChatStore((state) => state.currentUserId);
  const focusMessage = useChatStore((state) => state.focusMessage);
  const hasQuery = query.trim() !== '';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useKeyboardShortcut('escape', onClose);

  return (
    <search className="absolute inset-x-2 top-2 z-20 flex max-h-[70%] flex-col rounded-lg border border-border bg-surface shadow-sm md:right-4 md:left-auto md:w-96">
      <div className="flex items-center gap-1 p-2">
        <SearchInput
          ref={inputRef}
          label="Search messages"
          placeholder="Search in this chat"
          value={query}
          onValueChange={setQuery}
          className="flex-1"
        />
        <IconButton icon={X} label="Close search" size="sm" onClick={onClose} />
      </div>
      <p role="status" className="sr-only">
        {hasQuery && !isLoading
          ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
          : ''}
      </p>
      {hasQuery && (
        <div className="min-h-0 overflow-y-auto border-t border-border">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Spinner label="Searching" />
            </div>
          ) : failed ? (
            <div className="flex flex-col items-center gap-2 p-4 text-sm text-text-muted">
              <p role="alert">Couldn't search messages.</p>
              <Button variant="secondary" size="sm" onClick={retry}>
                Try again
              </Button>
            </div>
          ) : results.length === 0 ? (
            <p className="flex items-center justify-center gap-2 p-4 text-sm text-text-muted">
              <SearchX aria-hidden className="size-4" />
              No messages match “{query.trim()}”
            </p>
          ) : (
            <ul className="p-1">
              {results.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => {
                      focusMessage(message.id);
                      onClose();
                    }}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-surface-muted"
                  >
                    <span className="flex justify-between gap-2 text-xs text-text-muted">
                      <span className="font-medium text-text">
                        {message.senderId === currentUserId
                          ? 'You'
                          : (users[message.senderId]?.name ?? 'Unknown user')}
                      </span>
                      <time dateTime={message.createdAt}>{formatListTime(message.createdAt)}</time>
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-sm text-text-muted">
                      {splitMatches(message.text, query).map((part, index) =>
                        part.match ? (
                          <mark key={index} className="rounded-sm bg-surface-active text-text">
                            {part.text}
                          </mark>
                        ) : (
                          part.text
                        ),
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </search>
  );
}
