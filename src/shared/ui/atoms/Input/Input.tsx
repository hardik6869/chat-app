import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

export interface InputProps extends ComponentProps<'input'> {
  invalid?: boolean;
}

/** Text field. 16px text so iOS doesn't zoom; `border-strong` keeps a 3:1 boundary (WCAG 1.4.11). */
export function Input({ invalid = false, className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-text placeholder:text-text-muted disabled:opacity-50 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}
