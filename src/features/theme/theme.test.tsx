import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { createThemeStore, themeStore } from './themeStore';
import { ThemeToggle } from './index';

function mockSystem(prefersDark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: prefersDark,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => media);
  return {
    listeners,
    change(dark: boolean) {
      media.matches = dark;
      listeners.forEach((listener) => {
        listener();
      });
    },
  };
}

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}

describe('createThemeStore', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows the system theme until the user chooses', () => {
    const system = mockSystem(true);
    const root = document.createElement('html');
    const store = createThemeStore({ storage: memoryStorage(), root });
    const unsubscribe = store.subscribe(vi.fn());

    expect(store.getTheme()).toBe('dark');
    expect(root).toHaveClass('dark');

    system.change(false);
    expect(store.getTheme()).toBe('light');
    expect(root).not.toHaveClass('dark');

    store.setTheme('dark');
    system.change(false);
    expect(store.getTheme()).toBe('dark');

    unsubscribe();
    expect(system.listeners.size).toBe(0);
  });

  it('restores a saved choice and ignores invalid values', () => {
    mockSystem(true);

    expect(
      createThemeStore({
        storage: memoryStorage('light'),
        root: document.createElement('html'),
      }).getTheme(),
    ).toBe('light');
    expect(
      createThemeStore({
        storage: memoryStorage('purple'),
        root: document.createElement('html'),
      }).getTheme(),
    ).toBe('dark');
  });
});

describe('ThemeToggle', () => {
  afterEach(() => {
    act(() => {
      themeStore.setTheme('light');
    });
  });

  it('switches between light and dark and updates its label', async () => {
    act(() => {
      themeStore.setTheme('light');
    });
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ThemeToggle />);

    await expectNoA11yViolations(container);
  });
});
