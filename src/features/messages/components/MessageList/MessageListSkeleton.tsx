import { Skeleton } from '@/shared/ui';

const WIDTHS = ['w-2/5', 'w-1/3', 'w-1/2', 'w-1/4', 'w-2/5'];

/** Placeholder bubbles while the latest page loads. */
export function MessageListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading messages"
      className="mx-auto w-full max-w-220 space-y-3 p-6"
    >
      {WIDTHS.map((width, index) => (
        <div key={index} className={index % 2 ? 'flex justify-end' : 'flex'}>
          <Skeleton className={`h-12 ${width} rounded-lg bg-surface`} />
        </div>
      ))}
    </div>
  );
}
