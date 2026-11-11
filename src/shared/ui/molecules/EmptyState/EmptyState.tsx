import { TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Button } from '../../atoms';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
}

/** Centered icon, title, one line of help and an optional action. Used for empty and error views. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn('flex flex-col items-center justify-center gap-3 p-6 text-center', className)}
    >
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          tone === 'danger'
            ? 'bg-surface-muted text-danger'
            : 'bg-surface-active text-primary-text',
        )}
      >
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-semibold text-text">{title}</p>
        {description && <p className="max-w-xs text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Announced error view with a retry button. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'Please check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      tone="danger"
      icon={TriangleAlert}
      title={title}
      description={description}
      className={className}
      action={
        onRetry && (
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
