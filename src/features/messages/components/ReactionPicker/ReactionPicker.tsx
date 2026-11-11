import { SmilePlus } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useClickOutside, useKeyboardShortcut } from '@/shared/hooks';
import { cn } from '@/shared/lib';
import { IconButton } from '@/shared/ui';
import { QUICK_REACTIONS } from '../../lib';

interface ReactionPickerProps {
  onPick: (emoji: string) => void;
  /** Open away from the bubble: `start` grows rightwards, `end` grows leftwards. */
  align?: 'start' | 'end';
  className?: string;
}

/**
 * "React" button with a small emoji popover. Opening focuses the first emoji; picking or Esc
 * closes it and returns focus to the button; clicking outside just closes it.
 */
export function ReactionPicker({ onPick, align = 'end', className }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstEmojiRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (open) firstEmojiRef.current?.focus();
  }, [open]);

  useClickOutside(
    containerRef,
    () => {
      close(false);
    },
    open,
  );
  useKeyboardShortcut(
    'escape',
    () => {
      close(true);
    },
    { enabled: open },
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <IconButton
        ref={triggerRef}
        icon={SmilePlus}
        label="React"
        size="sm"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => {
          setOpen((value) => !value);
        }}
      />
      {open && (
        <div
          id={popoverId}
          role="group"
          aria-label="Pick a reaction"
          className={cn(
            'absolute bottom-full z-10 mb-2 flex gap-0.5 rounded-full border border-border bg-surface p-1 shadow-sm',
            align === 'start' ? 'left-0' : 'right-0',
          )}
        >
          {QUICK_REACTIONS.map(({ emoji, name }, index) => (
            <button
              key={emoji}
              ref={index === 0 ? firstEmojiRef : undefined}
              type="button"
              aria-label={`React with ${name}`}
              title={name}
              onClick={() => {
                onPick(emoji);
                close(true);
              }}
              className="flex size-9 items-center justify-center rounded-full text-lg transition-transform hover:scale-110 hover:bg-surface-muted motion-reduce:hover:scale-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
