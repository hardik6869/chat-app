import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import { Spinner } from '../Spinner';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles';

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
      className={cn(buttonClassName({ variant, size }), className)}
      {...props}
    >
      {loading && <Spinner label={null} className="size-4" />}
      {children}
    </button>
  );
}
