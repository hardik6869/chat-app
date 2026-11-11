import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import { buttonBase, buttonVariants, type ButtonSize, type ButtonVariant } from '../Button';

const sizes: Record<ButtonSize, { button: string; icon: string }> = {
  sm: { button: 'size-8 pointer-coarse:size-10', icon: 'size-4' },
  md: { button: 'size-10 pointer-coarse:size-11', icon: 'size-5' },
};

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: LucideIcon;
  /** Required: icon-only buttons need an accessible name (WCAG 4.1.2). */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        buttonBase,
        'rounded-full',
        buttonVariants[variant],
        sizes[size].button,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className={sizes[size].icon} />
    </button>
  );
}
