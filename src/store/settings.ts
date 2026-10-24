import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type {
  AssetClass,
  BaseCurrency,
  MarketColorScheme,
  NumberFormatPreference,
  ThemeMode,
  TimeRange,
  UserSettings,
} from '@/types';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  marketColors: 'red-up',
  defaultAssetClass: 'all',
  defaultTimeRange: '1M',
  numberFormat: 'compact',
  baseCurrency: 'USD',
  sidebarCollapsed: false,
};

interface SettingsState extends UserSettings {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setMarketColors: (scheme: MarketColorScheme) => void;
  toggleMarketColors: () => void;
  setDefaultAssetClass: (assetClass: AssetClass | 'all') => void;
  setDefaultTimeRange: (range: TimeRange) => void;
  setNumberFormat: (format: NumberFormatPreference) => void;
  setBaseCurrency: (currency: BaseCurrency) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  reset: () => void;
}

export function applyThemeToDocument(theme: ThemeMode, marketColors: MarketColorScheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-market-colors', marketColors);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setMarketColors: (marketColors) => set({ marketColors }),
      toggleMarketColors: () =>
        set({ marketColors: get().marketColors === 'red-up' ? 'green-up' : 'red-up' }),
      setDefaultAssetClass: (defaultAssetClass) => set({ defaultAssetClass }),
      setDefaultTimeRange: (defaultTimeRange) => set({ defaultTimeRange }),
      setNumberFormat: (numberFormat) => set({ numberFormat }),
      setBaseCurrency: (baseCurrency) => set({ baseCurrency }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'finscope.settings.v1',
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        marketColors: state.marketColors,
        defaultAssetClass: state.defaultAssetClass,
        defaultTimeRange: state.defaultTimeRange,
        numberFormat: state.numberFormat,
        baseCurrency: state.baseCurrency,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

export function usePreferences() {
  return useSettingsStore(
    useShallow((state) => ({
      theme: state.theme,
      marketColors: state.marketColors,
      defaultAssetClass: state.defaultAssetClass,
      defaultTimeRange: state.defaultTimeRange,
      numberFormat: state.numberFormat,
      baseCurrency: state.baseCurrency,
      sidebarCollapsed: state.sidebarCollapsed,
    })),
  );
}
