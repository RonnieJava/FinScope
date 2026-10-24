import { useMemo } from 'react';
import { useSettingsStore } from '@/store/settings';

export interface ChartTheme {
  up: string;
  down: string;
  accent: string;
  grid: string;
  muted: string;
  border: string;
  panel: string;
  fg: string;
  warn: string;
  areaTop: string;
  areaBottom: string;
  key: string;
}

function readVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function useChartTheme(): ChartTheme {
  const theme = useSettingsStore((state) => state.theme);
  const marketColors = useSettingsStore((state) => state.marketColors);

  return useMemo<ChartTheme>(
    () => ({
      up: readVar('--up', '#f04452'),
      down: readVar('--down', '#22a06b'),
      accent: readVar('--accent', '#4f8cff'),
      grid: readVar('--grid-line', 'rgba(148,163,184,.14)'),
      muted: readVar('--muted', '#94a3b8'),
      border: readVar('--border', '#263241'),
      panel: readVar('--panel', '#111821'),
      fg: readVar('--fg', '#f1f5f9'),
      warn: readVar('--warn', '#f5b942'),
      areaTop: readVar('--chart-area-top', 'rgba(79,140,255,.26)'),
      areaBottom: readVar('--chart-area-bottom', 'rgba(79,140,255,.01)'),
      key: `${theme}:${marketColors}`,
    }),
    [theme, marketColors],
  );
}
