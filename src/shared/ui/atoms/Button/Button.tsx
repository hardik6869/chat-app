import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import { Spinner } from '../Spinner';
import { buttonBase, buttonVariants, type ButtonSize, type ButtonVariant } from './buttonStyles';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={Boolean(disabled) || loading}
      aria-busy={loading || undefined}
      className={cn(buttonBase, buttonVariants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Spinner label={null} className="size-4" />}
      {children}
    </button>
  );
}
