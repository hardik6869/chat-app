import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { MAX_MESSAGE_LENGTH } from '@/entities';
import { useAutoResize } from '@/shared/hooks';
import { useChatStore } from '@/store';

interface ComposerValues {
  text: string;
}

/** Show the character counter once the message gets close to the limit. */
const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 500;

/**
 * Composer behaviour: draft per conversation, Enter to send, Shift+Enter for a new line,
 * IME-safe, auto-growing field and optimistic send through the store.
 */
export function useComposer(conversationId: string) {
  const initialDraft = useChatStore.getState().drafts[conversationId] ?? '';
  const setDraft = useChatStore((state) => state.setDraft);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const target = useChatStore((state) => state.composerTargets[conversationId]);
  const setComposerTarget = useChatStore((state) => state.setComposerTarget);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { register, handleSubmit, reset, setFocus, control } = useForm<ComposerValues>({
    defaultValues: { text: initialDraft },
  });
  const text = useWatch({ control, name: 'text' });
  useAutoResize(textareaRef, text);

  const cancelTarget = useCallback(() => {
    setComposerTarget(conversationId, undefined);
  }, [conversationId, setComposerTarget]);

  // Picking "Reply" moves the cursor to the composer.
  useEffect(() => {
    if (target) setFocus('text');
  }, [target, setFocus]);

  const { ref: registerRef, ...field } = register('text', {
    maxLength: MAX_MESSAGE_LENGTH,
    onChange: (event: { target: { value: string } }) => {
      setDraft(conversationId, event.target.value);
    },
  });

  const textareaProps = {
    ...field,
    maxLength: MAX_MESSAGE_LENGTH,
    ref: (element: HTMLTextAreaElement | null) => {
      registerRef(element);
      textareaRef.current = element;
    },
  };

  const submit = handleSubmit(({ text: value }) => {
    if (!value.trim()) return;
    reset({ text: '' });
    setDraft(conversationId, '');
    setFocus('text');
    void sendMessage(conversationId, value, target?.messageId);
    cancelTarget();
  });

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && target) {
      event.preventDefault();
      cancelTarget();
      return;
    }
    // Enter sends; Shift+Enter is a new line; ignore Enter while an IME is composing.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void submit();
  };

  return {
    target,
    cancelTarget,
    textareaProps,
    onKeyDown,
    onSubmit: submit,
    canSend: text.trim().length > 0,
    length: text.length,
    showCounter: text.length >= COUNTER_THRESHOLD,
    maxLength: MAX_MESSAGE_LENGTH,
  };
}
