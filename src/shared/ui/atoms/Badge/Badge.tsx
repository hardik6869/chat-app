import { cn } from '@/shared/lib';

export interface BadgeProps {
  count: number;
  /** Screen-reader text, e.g. "3 unread messages". Defaults to the number. */
  label?: string;
  max?: number;
  className?: string;
}

/** Pill counter. Renders nothing for zero, so callers don't need a condition. */
export function Badge({ count, label, max = 99, className }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-fg tabular-nums',
        className,
      )}
    >
      <span aria-hidden>{count > max ? `${max}+` : count}</span>
      <span className="sr-only">{label ?? count}</span>
    </span>
  );
}
