import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  captureError,
  cn,
  copyToClipboard,
  createId,
  formatFileSize,
  safeStorage,
  setErrorReporter,
} from '@/shared/lib';

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes text and resolves true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('resolves false and reports when the clipboard is unavailable', async () => {
    const reporter = vi.fn();
    const restore = setErrorReporter(reporter);
    vi.stubGlobal('navigator', {});

    await expect(copyToClipboard('hello')).resolves.toBe(false);
    expect(reporter).toHaveBeenCalledOnce();
    restore();
  });
});

describe('cn', () => {
  it('joins conditional classes', () => {
    expect(cn('px-2', null, undefined, { hidden: false, 'font-bold': true })).toBe(
      'px-2 font-bold',
    );
  });

  it('lets later Tailwind classes win, including custom tokens', () => {
    expect(cn('p-4 text-sm text-text', 'p-2 text-text-muted')).toBe('text-sm p-2 text-text-muted');
  });
});

describe('createId', () => {
  it('creates unique ids with an optional prefix', () => {
    const a = createId('msg');
    const b = createId('msg');

    expect(a).toMatch(/^msg_[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
    expect(createId()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('captureError', () => {
  it('sends reports to the active reporter and restores the previous one', () => {
    const reporter = vi.fn();
    const restore = setErrorReporter(reporter);
    const error = new Error('boom');

    captureError(error, 'test');
    restore();
    captureError(new Error('ignored'));

    expect(reporter).toHaveBeenCalledOnce();
    expect(reporter).toHaveBeenCalledWith(
      expect.objectContaining({ error, context: 'test', timestamp: expect.any(Number) as number }),
    );
  });
});

describe('safeStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('reads, writes and removes values', () => {
    safeStorage.setItem('key', 'value');
    expect(safeStorage.getItem('key')).toBe('value');

    safeStorage.removeItem('key');
    expect(safeStorage.getItem('key')).toBeNull();
  });

  it('never throws when storage is unavailable and reports the error', () => {
    const reporter = vi.fn();
    const restore = setErrorReporter(reporter);
    const failure = new DOMException('blocked', 'SecurityError');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw failure;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw failure;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw failure;
    });

    expect(safeStorage.getItem('key')).toBeNull();
    expect(() => {
      safeStorage.setItem('key', 'value');
    }).not.toThrow();
    expect(() => {
      safeStorage.removeItem('key');
    }).not.toThrow();
    expect(reporter).toHaveBeenCalledTimes(3);
    restore();
  });
});

describe('formatFileSize', () => {
  it.each([
    [512, '512 B'],
    [2048, '2 KB'],
    [1536, '1.5 KB'],
    [2_400_000, '2.3 MB'],
    [15 * 1024 * 1024, '15 MB'],
  ])('%d → %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
