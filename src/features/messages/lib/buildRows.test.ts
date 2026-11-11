import { describe, expect, it } from 'vitest';
import type { Message } from '@/entities';
import { buildRows } from './index';

const at = (day: number, hour: number, minute: number) =>
  new Date(2026, 10, day, hour, minute).toISOString();

const message = (id: string, senderId: string, createdAt: string): Message => ({
  id,
  conversationId: 'c1',
  senderId,
  text: id,
  createdAt,
  status: 'read',
  reactions: [],
});

describe('buildRows', () => {
  it('adds a date separator before the first message of each day', () => {
    const rows = buildRows(
      [message('a', 'ava', at(10, 9, 0)), message('b', 'ava', at(11, 9, 0))],
      'me',
    );

    expect(rows.map((row) => row.type)).toEqual(['date', 'message', 'date', 'message']);
  });

  it('groups consecutive messages from one sender within five minutes', () => {
    const rows = buildRows(
      [
        message('a', 'ava', at(11, 9, 0)),
        message('b', 'ava', at(11, 9, 4)),
        message('c', 'ava', at(11, 9, 20)),
        message('d', 'me', at(11, 9, 21)),
      ],
      'me',
    ).filter((row) => row.type === 'message');

    expect(rows.map((row) => [row.messageId, row.isFirstInGroup])).toEqual([
      ['a', true],
      ['b', false],
      ['c', true],
      ['d', true],
    ]);
    expect(rows.map((row) => row.isOwn)).toEqual([false, false, false, true]);
  });

  it('never groups across midnight', () => {
    const rows = buildRows(
      [message('a', 'ava', at(10, 23, 58)), message('b', 'ava', at(11, 0, 1))],
      'me',
    ).filter((row) => row.type === 'message');

    expect(rows.every((row) => row.isFirstInGroup)).toBe(true);
  });

  it('returns nothing for an empty thread', () => {
    expect(buildRows([], 'me')).toEqual([]);
  });
});
