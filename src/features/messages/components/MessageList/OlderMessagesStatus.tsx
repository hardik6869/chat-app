import type { LoadStatus } from '@/store';
import { Spinner } from '@/shared/ui';

interface OlderMessagesStatusProps {
  status: LoadStatus;
  onRetry: () => void;
}

/** Small pill at the top while older messages load, or with a retry if that failed. */
export function OlderMessagesStatus({ status, onRetry }: OlderMessagesStatusProps) {
  if (status !== 'loading' && status !== 'error') return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
      <p className="pointer-events-auto flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-text-muted shadow-sm">
        {status === 'loading' ? (
          <>
            <Spinner label={null} className="size-4" />
            <span role="status">Loading older messages…</span>
          </>
        ) : (
          <>
            <span role="alert">Couldn't load older messages.</span>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-sm font-semibold text-primary-text underline"
            >
              Retry
            </button>
          </>
        )}
      </p>
    </div>
  );
}
