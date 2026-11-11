import { useCallback, useSyncExternalStore } from 'react';
import { themeStore } from './themeStore';

// Stable references so React subscribes once.
const subscribe = (listener: () => void) => themeStore.subscribe(listener);
const getTheme = () => themeStore.getTheme();

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);

  const toggleTheme = useCallback(() => {
    themeStore.setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggleTheme };
}
