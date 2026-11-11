import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  useAutoResize,
  useClickOutside,
  useDebounce,
  useKeyboardShortcut,
  useMediaQuery,
} from '@/shared/hooks';

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates only after the value stops changing', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 250), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe('abc');
  });
});

describe('useMediaQuery', () => {
  function mockMatchMedia(initial: boolean) {
    const listeners = new Set<() => void>();
    const state = { matches: initial };
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        get matches() {
          return state.matches;
        },
        addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      })),
    );
    return {
      listeners,
      change(matches: boolean) {
        state.matches = matches;
        listeners.forEach((listener) => {
          listener();
        });
      },
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows media query changes and unsubscribes on unmount', () => {
    const media = mockMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      media.change(true);
    });
    expect(result.current).toBe(true);

    unmount();
    expect(media.listeners.size).toBe(0);
  });
});

describe('useClickOutside', () => {
  function Popover({ onOutside, enabled }: { onOutside: () => void; enabled?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, onOutside, enabled);
    return (
      <div>
        <div ref={ref}>inside</div>
        <span>outside</span>
      </div>
    );
  }

  it('fires only for presses outside the element', () => {
    const onOutside = vi.fn();
    render(<Popover onOutside={onOutside} />);

    fireEvent.pointerDown(screen.getByText('inside'));
    expect(onOutside).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText('outside'));
    expect(onOutside).toHaveBeenCalledOnce();
  });

  it('does nothing when disabled', () => {
    const onOutside = vi.fn();
    render(<Popover onOutside={onOutside} enabled={false} />);

    fireEvent.pointerDown(screen.getByText('outside'));
    expect(onOutside).not.toHaveBeenCalled();
  });
});

describe('useKeyboardShortcut', () => {
  it.each([
    ['mod+k', { key: 'k', ctrlKey: true }, true],
    ['mod+k', { key: 'K', metaKey: true }, true],
    ['mod+k', { key: 'k' }, false],
    ['mod+k', { key: 'k', ctrlKey: true, shiftKey: true }, false],
    ['escape', { key: 'Escape' }, true],
    ['escape', { key: 'Escape', ctrlKey: true }, false],
    ['shift+enter', { key: 'Enter', shiftKey: true }, true],
    ['alt+f', { key: 'f', altKey: true }, true],
  ])('%s with %o → %s', (shortcut, init, expected) => {
    const onTrigger = vi.fn();
    renderHook(() => {
      useKeyboardShortcut(shortcut, onTrigger);
    });

    const event = new KeyboardEvent('keydown', { ...init, cancelable: true });
    window.dispatchEvent(event);

    expect(onTrigger).toHaveBeenCalledTimes(expected ? 1 : 0);
    expect(event.defaultPrevented).toBe(expected);
  });

  it('skips disabled shortcuts, handled events and removes the listener on unmount', () => {
    const onTrigger = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ enabled }) => {
        useKeyboardShortcut('escape', onTrigger, { enabled, preventDefault: false });
      },
      { initialProps: { enabled: false } },
    );
    fireEvent.keyDown(window, { key: 'Escape' });

    rerender({ enabled: true });
    const handled = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    handled.preventDefault();
    window.dispatchEvent(handled);
    expect(onTrigger).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onTrigger).toHaveBeenCalledOnce();

    unmount();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onTrigger).toHaveBeenCalledOnce();
  });
});

describe('useAutoResize', () => {
  function Field({ value }: { value: string }) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useAutoResize(ref, value);
    return <textarea ref={ref} aria-label="field" value={value} readOnly />;
  }

  it('grows with content and returns to the natural height when empty', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(96);
    const { rerender } = render(<Field value="three lines of text" />);
    const field = screen.getByRole('textbox', { name: 'field' });
    expect(field.style.height).toBe('96px');

    rerender(<Field value="" />);
    expect(field.style.height).toBe('');
  });
});
