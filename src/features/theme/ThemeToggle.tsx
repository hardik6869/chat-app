import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/shared/ui';
import { useTheme } from './useTheme';

/** Icon shows the theme you'll switch to; the label says it in words. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <IconButton
      icon={isDark ? Sun : Moon}
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    />
  );
}
