import { describe, expect, it } from 'vitest';
import { formatDayLabel, formatListTime, formatTime, groupByDay } from '@/shared/lib';

const LOCALE = 'en-US';
const NOW = new Date(2026, 10, 11, 15, 30); // Wed 11 Nov 2026, 3:30 PM
const at = (day: number, hour = 9, minute = 41, month = 10, year = 2026) =>
  new Date(year, month, day, hour, minute);

describe('formatTime', () => {
  it('formats hours and minutes', () => {
    expect(formatTime(at(11), LOCALE)).toBe('9:41 AM');
  });

  it('accepts ISO strings and timestamps', () => {
    expect(formatTime(at(11).toISOString(), LOCALE)).toBe('9:41 AM');
    expect(formatTime(at(11).getTime(), LOCALE)).toBe('9:41 AM');
  });
});

describe('formatListTime', () => {
  it.each([
    ['today → time', at(11), '9:41 AM'],
    ['yesterday', at(10), 'Yesterday'],
    ['this week → short weekday', at(7), 'Sat'],
    ['older → numeric date', at(1), '11/1/26'],
  ])('%s', (_case, value, expected) => {
    expect(formatListTime(value, NOW, LOCALE)).toBe(expected);
  });
});

describe('formatDayLabel', () => {
  it.each([
    ['today', at(11), 'Today'],
    ['yesterday', at(10, 23, 59), 'Yesterday'],
    ['this week → weekday', at(6), 'Friday'],
    ['same year → day and month', at(3, 9, 0, 0), 'January 3'],
    ['other year → full date', at(30, 9, 0, 11, 2025), 'December 30, 2025'],
  ])('%s', (_case, value, expected) => {
    expect(formatDayLabel(value, NOW, LOCALE)).toBe(expected);
  });
});

describe('groupByDay', () => {
  it('groups consecutive items by calendar day', () => {
    const items = [at(9, 8), at(9, 22), at(10, 0, 5), at(11, 7), at(11, 12)].map((date, i) => ({
      id: i,
      date,
    }));

    const groups = groupByDay(items, (item) => item.date);

    expect(groups.map((group) => group.items.map((item) => item.id))).toEqual([
      [0, 1],
      [2],
      [3, 4],
    ]);
    expect(groups[0]?.date).toEqual(new Date(2026, 10, 9));
  });

  it('returns an empty list for no items', () => {
    expect(groupByDay([], () => NOW)).toEqual([]);
  });
});
