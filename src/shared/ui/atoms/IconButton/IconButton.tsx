import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import {
  iconButtonClassName,
  iconButtonSizes,
  type ButtonSize,
  type ButtonVariant,
} from '../Button';

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
      className={cn(iconButtonClassName({ variant, size }), className)}
      {...props}
    >
      <Icon aria-hidden className={iconButtonSizes[size].icon} />
    </button>
  );
}
