import { Check, Paperclip, SendHorizontal } from 'lucide-react';
import { useId, useRef } from 'react';
import { cn } from '@/shared/lib';
import { IconButton, Textarea } from '@/shared/ui';
import { useComposer } from '../../hooks';
import { AttachmentPreviews } from '../Attachments';
import { ComposerTargetBar } from '../ComposerTargetBar';

/** Pinned message box: grows to 6 lines, Enter sends, Shift+Enter adds a line. */
export function Composer({ conversationId }: { conversationId: string }) {
  const {
    target,
    cancelTarget,
    isEditing,
    textareaProps,
    onKeyDown,
    onSubmit,
    canSend,
    attachments,
    addFiles,
    removeFile,
    isReady,
    placeholder,
    length,
    showCounter,
    maxLength,
  } = useComposer(conversationId);
  const hintId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="shrink-0 border-t border-border bg-surface px-3 py-3 md:px-6"
    >
      {target && <ComposerTargetBar target={target} onCancel={cancelTarget} />}
      <AttachmentPreviews attachments={attachments} onRemove={removeFile} />
      <div className="mx-auto flex max-w-220 items-end gap-2">
        {!isEditing && (
          <>
            <IconButton
              icon={Paperclip}
              label="Attach files"
              disabled={!isReady}
              onClick={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              aria-hidden
              tabIndex={-1}
              onChange={(event) => {
                addFiles(event.target.files ?? []);
                event.target.value = '';
              }}
            />
          </>
        )}
        <Textarea
          {...textareaProps}
          aria-label="Message"
          aria-describedby={hintId}
          placeholder={placeholder}
          disabled={!isReady}
          onKeyDown={onKeyDown}
          className="max-h-40 overflow-y-auto"
        />
        <IconButton
          icon={isEditing ? Check : SendHorizontal}
          label={isEditing ? 'Save changes' : 'Send message'}
          variant="primary"
          type="submit"
          disabled={!canSend}
        />
      </div>
      <p id={hintId} className="sr-only">
        Press Enter to send and Shift+Enter for a new line.
      </p>
      {showCounter && (
        <p
          aria-live="polite"
          className={cn(
            'mx-auto mt-1 max-w-220 text-right text-xs tabular-nums',
            length >= maxLength ? 'text-danger' : 'text-text-muted',
          )}
        >
          {length} / {maxLength}
        </p>
      )}
    </form>
  );
}
