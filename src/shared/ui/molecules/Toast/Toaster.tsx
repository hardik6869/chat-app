import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/shared/lib';
import { IconButton } from '../../atoms';
import { toast, useToasts, type ToastItem, type ToastTone } from './toastStore';

const AUTO_DISMISS_MS = 4000;

const icons = { info: Info, success: CircleCheck, error: CircleAlert } as const;
const iconColors: Record<ToastTone, string> = {
  info: 'text-primary-text',
  success: 'text-accent',
  error: 'text-danger',
};

function Toast({ item }: { item: ToastItem }) {
  const Icon = icons[item.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      toast.dismiss(item.id);
    }, AUTO_DISMISS_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [item.id]);

  return (
    <li className="pointer-events-auto flex w-full items-center gap-3 rounded-lg border border-border bg-surface py-2 pr-2 pl-4 text-sm text-text shadow-sm">
      <Icon aria-hidden className={cn('size-5 shrink-0', iconColors[item.tone])} />
      <p role={item.tone === 'error' ? 'alert' : 'status'} className="flex-1">
        {item.message}
      </p>
      <IconButton
        icon={X}
        label="Dismiss notification"
        size="sm"
        onClick={() => {
          toast.dismiss(item.id);
        }}
      />
    </li>
  );
}

/** Renders queued toasts. Mount once at the app root. */
export function Toaster() {
  const toasts = useToasts();

  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <ol className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <Toast key={item.id} item={item} />
        ))}
      </ol>
    </section>
  );
}
