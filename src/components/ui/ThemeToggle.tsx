import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/store/settings';

interface ThemeToggleProps {
  withLabel?: boolean;
}

export function ThemeToggle({ withLabel = false }: ThemeToggleProps) {
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fs-icon-btn"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {withLabel ? <span className="ml-1 text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span> : null}
    </button>
  );
}
