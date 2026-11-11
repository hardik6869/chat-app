import { UserPlus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useKeyboardShortcut } from '@/shared/hooks';
import { Avatar, Button, IconButton } from '@/shared/ui';
import { useGroupInfo, useMemberActions } from '../../hooks';
import { AddMemberDialog } from '../AddMemberDialog';
import { MemberList } from '../MemberList';

interface GroupInfoPanelProps {
  conversationId: string;
  onClose: () => void;
}

/**
 * Group details and members. Desktop (≥1280 px): side panel. Tablet: drawer over the chat.
 * Phone: full screen. Esc closes it (unless the add-member dialog is open).
 */
export function GroupInfoPanel({ conversationId, onClose }: GroupInfoPanelProps) {
  const { group, members, candidates, currentUserId, onlineCount } = useGroupInfo(conversationId);
  const { pendingId, add, remove } = useMemberActions(conversationId);
  const [adding, setAdding] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useKeyboardShortcut('escape', onClose, { enabled: !adding });

  if (!group) return null;

  return (
    <aside
      aria-labelledby={titleId}
      className="absolute inset-0 z-30 flex flex-col bg-surface md:left-auto md:w-80 md:border-l md:border-border md:shadow-sm xl:static xl:shadow-none"
    >
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 id={titleId} ref={titleRef} tabIndex={-1} className="font-semibold text-text">
          Group info
        </h2>
        <IconButton icon={X} label="Close group info" onClick={onClose} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="flex flex-col items-center gap-2 border-b border-border p-6 text-center">
          <Avatar name={group.name} src={group.avatarUrl} size="xl" />
          <p className="text-lg font-semibold text-text">{group.name}</p>
          {group.description && <p className="text-sm text-text-muted">{group.description}</p>}
          <p className="text-xs text-text-muted">
            {members.length} members · {onlineCount} online
          </p>
        </section>
        <section className="p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold text-text">Members</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAdding(true);
              }}
            >
              <UserPlus aria-hidden className="size-4" />
              Add member
            </Button>
          </div>
          <MemberList
            members={members}
            currentUserId={currentUserId}
            adminIds={group.adminIds}
            pendingId={pendingId}
            onRemove={(userId) => {
              void remove(userId);
            }}
          />
        </section>
      </div>
      <AddMemberDialog
        open={adding}
        candidates={candidates}
        onClose={() => {
          setAdding(false);
        }}
        onAdd={add}
      />
    </aside>
  );
}
