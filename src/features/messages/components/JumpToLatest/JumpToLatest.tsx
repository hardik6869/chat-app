import { ArrowDown } from 'lucide-react';
import { cn } from '@/shared/lib';
import { buttonBase, buttonVariants } from '@/shared/ui';

interface JumpToLatestProps {
  unseenCount: number;
  onClick: () => void;
}

/** Floating button shown when scrolled up: a pill with the count of new messages, or an arrow. */
export function JumpToLatest({ unseenCount, onClick }: JumpToLatestProps) {
  const label =
    unseenCount > 0
      ? `${unseenCount} new ${unseenCount === 1 ? 'message' : 'messages'}`
      : 'Jump to latest message';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        buttonBase,
        'absolute right-4 bottom-4 h-10 rounded-full shadow-sm',
        unseenCount > 0 ? cn(buttonVariants.primary, 'px-4 text-sm') : 'w-10 bg-surface text-text',
      )}
    >
      {unseenCount > 0 && <span aria-hidden>{label}</span>}
      <ArrowDown aria-hidden className="size-4" />
    </button>
  );
}
