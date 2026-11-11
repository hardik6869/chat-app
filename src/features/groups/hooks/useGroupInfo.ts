import { useMemo } from 'react';
import { isGroup, type User } from '@/entities';
import { useChatStore } from '@/store';

/** True when the conversation is a group (shows the group info button). */
export function useIsGroup(conversationId: string): boolean {
  return useChatStore((state) => {
    const conversation = state.conversations[conversationId];
    return conversation ? isGroup(conversation) : false;
  });
}

/** Group details, members (me first, then online, then A–Z) and people who could be added. */
export function useGroupInfo(conversationId: string) {
  const group = useChatStore((state) => {
    const conversation = state.conversations[conversationId];
    return conversation && isGroup(conversation) ? conversation : undefined;
  });
  const users = useChatStore((state) => state.users);
  const currentUserId = useChatStore((state) => state.currentUserId);

  const members = useMemo(() => {
    const list = (group?.memberIds ?? []).flatMap((id) => users[id] ?? []);
    const rank = (user: User) => (user.id === currentUserId ? 0 : user.isOnline ? 1 : 2);
    return list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }, [group, users, currentUserId]);

  const candidates = useMemo(
    () =>
      Object.values(users)
        .filter((user) => !group?.memberIds.includes(user.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [group, users],
  );

  return {
    group,
    members,
    candidates,
    currentUserId,
    onlineCount: members.filter((member) => member.isOnline).length,
  };
}
