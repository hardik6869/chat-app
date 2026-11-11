import { formatListTime } from '@/shared/lib';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  /** ISO timestamp, shown as "last seen" when offline. */
  lastSeenAt?: string;
}

export type UsersById = Readonly<Record<string, User>>;

/** "Online", "Last seen 9:41 AM" / "Last seen Yesterday", or "Offline". */
export function presenceText(user: User | undefined): string {
  if (user?.isOnline) return 'Online';
  return user?.lastSeenAt ? `Last seen ${formatListTime(user.lastSeenAt)}` : 'Offline';
}
