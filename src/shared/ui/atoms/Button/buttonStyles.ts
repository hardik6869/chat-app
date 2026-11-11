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
