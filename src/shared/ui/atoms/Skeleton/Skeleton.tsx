import { cn } from '@/shared/lib';

/** Decorative placeholder block. Wrap groups in an element with `role="status"` to announce loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block animate-pulse rounded-md bg-surface-muted', className)}
    />
  );
}
