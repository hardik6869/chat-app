import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

/** Multi-line field matching Input: 16px text (no iOS zoom), `border-strong` for a 3:1 boundary. */
export function Textarea({ className, rows = 1, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-text placeholder:text-text-muted disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
