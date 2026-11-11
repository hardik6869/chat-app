import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks';

/** Slim notice while offline. The live region stays mounted so the change is announced. */
export function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <div role="status">
      {!online && (
        <p className="flex items-center justify-center gap-2 bg-surface-active px-4 py-2 text-sm font-medium text-primary-text">
          <WifiOff aria-hidden className="size-4" />
          You're offline. Messages will send when you reconnect.
        </p>
      )}
    </div>
  );
}
