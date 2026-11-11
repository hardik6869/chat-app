import { UserMinus } from 'lucide-react';
import { presenceText, type User } from '@/entities';
import { cn } from '@/shared/lib';
import { Avatar, IconButton, Spinner } from '@/shared/ui';

interface MemberListProps {
  members: readonly User[];
  currentUserId: string;
  adminIds: readonly string[];
  pendingId?: string;
  onRemove: (userId: string) => void;
}

/** Members with photo, online dot + text, admin badge and a remove button (not for me). */
export function MemberList({
  members,
  currentUserId,
  adminIds,
  pendingId,
  onRemove,
}: MemberListProps) {
  return (
    <ul className="space-y-0.5">
      {members.map((member) => {
        const isMe = member.id === currentUserId;
        return (
          <li key={member.id} className="flex h-14 items-center gap-3 rounded-lg px-2">
            <Avatar name={member.name} src={member.avatarUrl} online={member.isOnline} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium text-text">
                {isMe ? `${member.name} (You)` : member.name}
                {adminIds.includes(member.id) && (
                  <span className="rounded-full bg-surface-active px-2 py-0.5 text-xs font-medium text-primary-text">
                    Admin
                  </span>
                )}
              </p>
              <p className={cn('text-xs', member.isOnline ? 'text-accent' : 'text-text-muted')}>
                {presenceText(member)}
              </p>
            </div>
            {!isMe &&
              (pendingId === member.id ? (
                <Spinner label={`Removing ${member.name}`} className="size-4" />
              ) : (
                <IconButton
                  icon={UserMinus}
                  label={`Remove ${member.name}`}
                  size="sm"
                  disabled={pendingId !== undefined}
                  onClick={() => {
                    onRemove(member.id);
                  }}
                />
              ))}
          </li>
        );
      })}
    </ul>
  );
}
