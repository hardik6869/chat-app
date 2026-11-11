/** Shared by Button and IconButton so every clickable control looks and behaves the same. */
export const buttonBase =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors select-none disabled:pointer-events-none disabled:opacity-50';

export const buttonVariants = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'bg-surface-muted text-text hover:bg-surface-active',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-muted hover:text-text',
  danger: 'bg-danger text-danger-fg hover:opacity-90',
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = 'sm' | 'md';

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export const iconButtonSizes: Record<ButtonSize, { button: string; icon: string }> = {
  sm: { button: 'size-8 pointer-coarse:size-10', icon: 'size-4' },
  md: { button: 'size-10 pointer-coarse:size-11', icon: 'size-5' },
};

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Button look for other elements, e.g. a router `<Link>` that should look like a button. */
export function buttonClassName({ variant = 'primary', size = 'md' }: StyleOptions = {}) {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]}`;
}

/** Icon-button look (round, touch-friendly) for other elements such as links. */
export function iconButtonClassName({ variant = 'ghost', size = 'md' }: StyleOptions = {}) {
  return `${buttonBase} rounded-full ${buttonVariants[variant]} ${iconButtonSizes[size].button}`;
}
