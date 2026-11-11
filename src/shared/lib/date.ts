type DateInput = Date | string | number;

interface DayGroup<T> {
  key: string;
  date: Date;
  items: T[];
}

const DAY_MS = 86_400_000;
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string | undefined, options: Intl.DateTimeFormatOptions) {
  const cacheKey = `${locale ?? ''}|${JSON.stringify(options)}`;
  let cached = formatterCache.get(cacheKey);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(cacheKey, cached);
  }
  return cached;
}

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

function startOfDay(value: DateInput): Date {
  const date = toDate(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days between `value` and `now` (0 = today, 1 = yesterday). DST-safe. */
function daysAgo(value: DateInput, now: DateInput): number {
  return Math.round((startOfDay(now).getTime() - startOfDay(value).getTime()) / DAY_MS);
}

function dayKey(value: DateInput): string {
  const date = toDate(value);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** "9:41 AM" — message bubbles. */
export function formatTime(value: DateInput, locale?: string): string {
  return formatter(locale, { hour: 'numeric', minute: '2-digit' }).format(toDate(value));
}

/** Today → time, Yesterday, this week → weekday, older → short date. Conversation list. */
export function formatListTime(value: DateInput, now: DateInput = new Date(), locale?: string) {
  const days = daysAgo(value, now);
  if (days <= 0) return formatTime(value, locale);
  if (days === 1) return 'Yesterday';
  if (days < 7) return formatter(locale, { weekday: 'short' }).format(toDate(value));
  return formatter(locale, { day: 'numeric', month: 'numeric', year: '2-digit' }).format(
    toDate(value),
  );
}

/** Today, Yesterday, weekday this week, otherwise full date. Date separators in a chat. */
export function formatDayLabel(value: DateInput, now: DateInput = new Date(), locale?: string) {
  const days = daysAgo(value, now);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return formatter(locale, { weekday: 'long' }).format(toDate(value));
  const sameYear = toDate(value).getFullYear() === toDate(now).getFullYear();
  return formatter(locale, {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(toDate(value));
}

/** Splits items (sorted oldest → newest) into consecutive calendar-day groups. */
export function groupByDay<T>(items: readonly T[], getDate: (item: T) => DateInput): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const date = toDate(getDate(item));
    const key = dayKey(date);
    const last = groups.at(-1);
    if (last?.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, date: startOfDay(date), items: [item] });
    }
  }
  return groups;
}
