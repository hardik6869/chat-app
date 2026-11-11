import { useCallback, useSyncExternalStore } from 'react';

/** Live result of a CSS media query, e.g. `useMediaQuery('(min-width: 768px)')`. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => {
        mediaQuery.removeEventListener('change', onChange);
      };
    },
    [query],
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
