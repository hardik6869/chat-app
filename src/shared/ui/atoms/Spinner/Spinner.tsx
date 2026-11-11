import { LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib';

export interface SpinnerProps {
  /** Announced to screen readers. Pass `null` when a parent already announces loading. */
  label?: string | null;
  className?: string;
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  const icon = <LoaderCircle aria-hidden className={cn('size-5 animate-spin', className)} />;
  if (label === null) return icon;

  return (
    <span role="status" className="inline-flex">
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
}
