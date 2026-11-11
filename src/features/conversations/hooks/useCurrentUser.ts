import { useChatStore } from '@/store';

/** The signed-in user, or undefined until the session has loaded. */
export function useCurrentUser() {
  return useChatStore((state) => state.users[state.currentUserId]);
}
