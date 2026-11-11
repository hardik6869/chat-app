import type { ReactNode } from 'react';
import type { ConversationFilter } from '@/store';
import { Avatar, ChipGroup, SearchInput, Skeleton } from '@/shared/ui';
import { useConversationFilters, useCurrentUser } from '../../hooks';
import { ConversationList } from '../ConversationList';

const FILTERS: readonly { value: ConversationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'groups', label: 'Groups' },
];

interface SidebarProps {
  /** Header buttons supplied by the app (e.g. theme toggle). */
  actions?: ReactNode;
}

/** Sidebar: 64 px header, search + filters, then the scrollable conversation list. */
export function Sidebar({ actions }: SidebarProps) {
  const currentUser = useCurrentUser();
  const { query, setQuery, debouncedQuery, filter, setFilter, searchRef } =
    useConversationFilters();

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        {currentUser ? (
          <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
        ) : (
          <Skeleton className="size-10 rounded-full" />
        )}
        <h1 className="flex-1 text-lg font-semibold text-text">Chats</h1>
        {actions}
      </header>
      <div className="shrink-0 space-y-3 border-b border-border p-3">
        <SearchInput
          ref={searchRef}
          label="Search conversations"
          placeholder="Search conversations"
          aria-keyshortcuts="Control+K Meta+K"
          value={query}
          onValueChange={setQuery}
        />
        <ChipGroup
          label="Filter conversations"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList filter={filter} query={debouncedQuery} />
      </div>
    </div>
  );
}
