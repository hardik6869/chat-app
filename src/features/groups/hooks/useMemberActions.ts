import { useState } from 'react';
import { captureError } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { useChatStore } from '@/store';

/** Add/remove group members through the mock API, with toasts and a pending state. */
export function useMemberActions(conversationId: string) {
  const addMember = useChatStore((state) => state.addMember);
  const removeMember = useChatStore((state) => state.removeMember);
  const [pendingId, setPendingId] = useState<string>();

  const nameOf = (userId: string) => useChatStore.getState().users[userId]?.name ?? 'Member';

  const run = async (userId: string, action: () => Promise<void>, done: string, failed: string) => {
    setPendingId(userId);
    try {
      await action();
      toast.success(done);
      return true;
    } catch (error) {
      captureError(error, 'groupMembers');
      toast.error(failed);
      return false;
    } finally {
      setPendingId(undefined);
    }
  };

  return {
    pendingId,
    add: (userId: string) =>
      run(
        userId,
        () => addMember(conversationId, userId),
        `Added ${nameOf(userId)}`,
        `Couldn't add ${nameOf(userId)}`,
      ),
    remove: (userId: string) =>
      run(
        userId,
        () => removeMember(conversationId, userId),
        `Removed ${nameOf(userId)}`,
        `Couldn't remove ${nameOf(userId)}`,
      ),
  };
}
