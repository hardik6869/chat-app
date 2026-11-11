import { X } from 'lucide-react';
import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { IconButton } from '../../atoms';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Action buttons, right-aligned. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Native `<dialog>`: the browser traps focus, makes the page inert, closes on Esc
 * and returns focus to the opener — no custom focus-trap code needed.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Mouse convenience: clicking the backdrop (the dialog element itself) closes it.
  // Keyboard users close with Esc or the Close button.
  const handleBackdropClick = useEffectEvent((event: MouseEvent) => {
    if (event.target === dialogRef.current) onClose();
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const listener = (event: MouseEvent) => {
      handleBackdropClick(event);
    };
    dialog.addEventListener('click', listener);
    return () => {
      dialog.removeEventListener('click', listener);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-surface p-0 text-text shadow-sm backdrop:bg-overlay',
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton icon={X} label="Close" size="sm" onClick={onClose} className="-mt-1 -mr-2" />
        </header>
        {children}
        {footer && <footer className="flex justify-end gap-2">{footer}</footer>}
      </div>
    </dialog>
  );
}
