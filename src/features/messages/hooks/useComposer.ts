import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { canEditMessage, MAX_MESSAGE_LENGTH } from '@/entities';
import { useAutoResize } from '@/shared/hooks';
import { captureError } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { selectThreadMessages, useChatStore } from '@/store';

interface ComposerValues {
  text: string;
}

/** Show the character counter once the message gets close to the limit. */
const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 500;

const draftOf = (conversationId: string) => useChatStore.getState().drafts[conversationId] ?? '';

/**
 * Composer behaviour: new message, reply or edit. Enter sends/saves, Shift+Enter adds a line,
 * Esc cancels reply/edit, ↑ in an empty field edits my last message. Drafts are per chat.
 */
export function useComposer(conversationId: string) {
  const setDraft = useChatStore((state) => state.setDraft);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const target = useChatStore((state) => state.composerTargets[conversationId]);
  const setComposerTarget = useChatStore((state) => state.setComposerTarget);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isEditing = target?.mode === 'edit';

  const { register, handleSubmit, reset, setFocus, control } = useForm<ComposerValues>({
    defaultValues: { text: draftOf(conversationId) },
  });
  const text = useWatch({ control, name: 'text' });
  useAutoResize(textareaRef, text);

  /** Leaves reply/edit mode; after editing, the unsent draft comes back. */
  const cancelTarget = useCallback(() => {
    if (isEditing) reset({ text: draftOf(conversationId) });
    setComposerTarget(conversationId, undefined);
  }, [conversationId, isEditing, reset, setComposerTarget]);

  // Reply/edit picked from a message: load the text to edit and put the cursor at its end.
  useEffect(() => {
    if (!target) return;
    if (target.mode === 'edit') {
      reset({ text: useChatStore.getState().messages[target.messageId]?.text ?? '' });
    }
    const element = textareaRef.current;
    element?.focus();
    element?.setSelectionRange(element.value.length, element.value.length);
  }, [target, reset]);

  const { ref: registerRef, ...field } = register('text', {
    maxLength: MAX_MESSAGE_LENGTH,
    onChange: (event: { target: { value: string } }) => {
      if (!isEditing) setDraft(conversationId, event.target.value);
    },
  });

  const submit = handleSubmit(({ text: value }) => {
    if (!value.trim()) return;
    if (target?.mode === 'edit') {
      const original = useChatStore.getState().messages[target.messageId]?.text;
      cancelTarget();
      if (value.trim() === original) return;
      editMessage(target.messageId, value).catch((error: unknown) => {
        captureError(error, 'editMessage');
        toast.error("Couldn't edit the message");
      });
      return;
    }
    reset({ text: '' });
    setDraft(conversationId, '');
    setFocus('text');
    void sendMessage(conversationId, value, target?.messageId);
    if (target) setComposerTarget(conversationId, undefined);
  });

  const editLastMessage = () => {
    const state = useChatStore.getState();
    const last = selectThreadMessages(state, conversationId).findLast((message) =>
      canEditMessage(message, state.currentUserId),
    );
    if (last) setComposerTarget(conversationId, { mode: 'edit', messageId: last.id });
    return last !== undefined;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && target) {
      event.preventDefault();
      cancelTarget();
    } else if (event.key === 'ArrowUp' && !text && !target && editLastMessage()) {
      event.preventDefault();
    } else if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      // Enter sends; Shift+Enter is a new line; ignore Enter while an IME is composing.
      event.preventDefault();
      void submit();
    }
  };

  return {
    target,
    cancelTarget,
    isEditing,
    textareaProps: {
      ...field,
      maxLength: MAX_MESSAGE_LENGTH,
      ref: (element: HTMLTextAreaElement | null) => {
        registerRef(element);
        textareaRef.current = element;
      },
    },
    onKeyDown,
    onSubmit: submit,
    canSend: text.trim().length > 0,
    length: text.length,
    showCounter: text.length >= COUNTER_THRESHOLD,
    maxLength: MAX_MESSAGE_LENGTH,
  };
}
