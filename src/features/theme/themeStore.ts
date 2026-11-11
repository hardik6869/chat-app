import { safeStorage } from '@/shared/lib';

export type Theme = 'light' | 'dark';

/** Same key is read by the inline script in index.html to avoid a flash of the wrong theme. */
const STORAGE_KEY = 'chat-app:theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

interface ThemeStoreOptions {
  storage?: Pick<typeof safeStorage, 'getItem' | 'setItem'>;
  root?: HTMLElement;
}

/**
 * Light/dark theme: follows the system until the user chooses, then remembers the choice.
 * Applies the `.dark` class on <html>, which switches every design token.
 */
export function createThemeStore({
  storage = safeStorage,
  root = document.documentElement,
}: ThemeStoreOptions = {}) {
  const media = window.matchMedia(DARK_QUERY);
  const listeners = new Set<() => void>();

  const stored = (): Theme | null => {
    const value = storage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  };
  const resolve = (): Theme => stored() ?? (media.matches ? 'dark' : 'light');

  let theme = resolve();

  const update = (next: Theme) => {
    theme = next;
    root.classList.toggle('dark', next === 'dark');
    listeners.forEach((listener) => {
      listener();
    });
  };

  const handleSystemChange = () => {
    if (!stored()) update(resolve());
  };

  root.classList.toggle('dark', theme === 'dark');

  return {
    getTheme: () => theme,

    setTheme(next: Theme) {
      storage.setItem(STORAGE_KEY, next);
      update(next);
    },

    subscribe(listener: () => void) {
      if (listeners.size === 0) media.addEventListener('change', handleSystemChange);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) media.removeEventListener('change', handleSystemChange);
      };
    },
  };
}

export const themeStore = createThemeStore();
