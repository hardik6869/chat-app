import { formatDayLabel } from '@/shared/lib';

/** Centered pill between days: Today, Yesterday, weekday, or full date. */
export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex justify-center pt-4 pb-1">
      <time
        dateTime={date}
        className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted shadow-sm"
      >
        {formatDayLabel(date)}
      </time>
    </div>
  );
}
