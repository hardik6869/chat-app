import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { canEditMessage } from '@/entities';
import { copyToClipboard } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { useChatStore } from '@/store';

/** Actions offered on one message, and which of them are allowed. */
export function useMessageActions(messageId: string) {
  const { conversationId, text, canEdit, canDelete } = useChatStore(
    useShallow((state) => {
      const message = state.messages[messageId];
      const isOwn = message?.senderId === state.currentUserId;
      return {
        conversationId: message?.conversationId,
        text: message?.deletedAt ? '' : (message?.text ?? ''),
        canEdit: message ? canEditMessage(message, state.currentUserId) : false,
        canDelete: isOwn && !message.deletedAt,
      };
    }),
  );
  const setComposerTarget = useChatStore((state) => state.setComposerTarget);
  const setPendingDelete = useChatStore((state) => state.setPendingDelete);

  const reply = useCallback(() => {
    if (conversationId) setComposerTarget(conversationId, { mode: 'reply', messageId });
  }, [conversationId, messageId, setComposerTarget]);

  const edit = useCallback(() => {
    if (conversationId) setComposerTarget(conversationId, { mode: 'edit', messageId });
  }, [conversationId, messageId, setComposerTarget]);

  const copy = useCallback(async () => {
    if (await copyToClipboard(text)) toast.success('Copied to clipboard');
    else toast.error("Couldn't copy the message");
  }, [text]);

  const requestDelete = useCallback(() => {
    setPendingDelete(messageId);
  }, [messageId, setPendingDelete]);

  return { reply, edit, copy, requestDelete, canCopy: text !== '', canEdit, canDelete };
}
