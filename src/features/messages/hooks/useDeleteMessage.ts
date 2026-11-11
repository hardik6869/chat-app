import { captureError } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { useChatStore } from '@/store';

/** Confirm/cancel for the message waiting to be deleted. */
export function useDeleteMessage() {
  const pendingId = useChatStore((state) => state.pendingDeleteId);
  const setPendingDelete = useChatStore((state) => state.setPendingDelete);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const setComposerTarget = useChatStore((state) => state.setComposerTarget);

  const cancel = () => {
    setPendingDelete(undefined);
  };

  const confirm = async () => {
    if (!pendingId) return;
    const { messages, composerTargets } = useChatStore.getState();
    const conversationId = messages[pendingId]?.conversationId;
    setPendingDelete(undefined);
    // Stop replying to / editing a message that no longer exists.
    if (conversationId && composerTargets[conversationId]?.messageId === pendingId) {
      setComposerTarget(conversationId, undefined);
    }
    try {
      await deleteMessage(pendingId);
    } catch (error) {
      captureError(error, 'deleteMessage');
      toast.error("Couldn't delete the message");
    }
  };

  return { isOpen: pendingId !== undefined, confirm, cancel };
}
