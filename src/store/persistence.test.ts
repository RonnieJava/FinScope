// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, applyThemeToDocument, useSettingsStore } from '@/store/settings';
import { useWatchlistStore } from '@/store/watchlist';

// Node 22+ ships an experimental `localStorage` global that is a non-functional
// stub unless `--localstorage-file` is passed. It shadows jsdom's implementation,
// so install a real in-memory Storage before the stores (and zustand's persist
// middleware) are evaluated.
vi.hoisted(() => {
  const data = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => (data.has(key) ? (data.get(key) as string) : null),
    key: (index: number) => Array.from(data.keys())[index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
  }
});

const WATCHLIST_KEY = 'finscope.watchlist.v1';
const SETTINGS_KEY = 'finscope.settings.v1';

function readPersisted(key: string): unknown {
  const raw = window.localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

describe('watchlist persistence', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ symbols: [] });
    window.localStorage.clear();
    useWatchlistStore.setState({ symbols: [] });
  });

  it('adds once, normalises the ticker and rejects duplicates', () => {
    expect(useWatchlistStore.getState().add('aapl')).toBe(true);
    expect(useWatchlistStore.getState().add('AAPL')).toBe(false);
    expect(useWatchlistStore.getState().symbols).toEqual(['AAPL']);
    expect(useWatchlistStore.getState().has('aapl')).toBe(true);
  });

  it('toggles a symbol on and off', () => {
    expect(useWatchlistStore.getState().toggle('MSFT')).toBe(true);
    expect(useWatchlistStore.getState().symbols).toContain('MSFT');

    expect(useWatchlistStore.getState().toggle('msft')).toBe(false);
    expect(useWatchlistStore.getState().symbols).not.toContain('MSFT');
  });

  it('writes the current list to localStorage', () => {
    useWatchlistStore.getState().add('NVDA');
    const persisted = readPersisted(WATCHLIST_KEY) as { state: { symbols: string[] } };
    expect(persisted.state.symbols).toEqual(['NVDA']);
  });

  it('rehydrates a saved list after a simulated reload', async () => {
    window.localStorage.setItem(
      WATCHLIST_KEY,
      JSON.stringify({ state: { symbols: ['TSLA', 'ETH-USD'] }, version: 1 }),
    );
    await useWatchlistStore.persist.rehydrate();
    expect(useWatchlistStore.getState().symbols).toEqual(['TSLA', 'ETH-USD']);
  });

  it('empties the list on clear', () => {
    useWatchlistStore.getState().add('AAPL');
    useWatchlistStore.getState().clear();
    expect(useWatchlistStore.getState().symbols).toEqual([]);
  });
});

describe('settings persistence', () => {
  beforeEach(() => {
    useSettingsStore.setState({ ...DEFAULT_SETTINGS });
    window.localStorage.clear();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS });
  });

  it('persists theme and market colour changes', () => {
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().setMarketColors('green-up');

    const persisted = readPersisted(SETTINGS_KEY) as {
      state: { theme: string; marketColors: string };
    };
    expect(persisted.state.theme).toBe('light');
    expect(persisted.state.marketColors).toBe('green-up');
  });

  it('toggles theme and market colours', () => {
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('light');
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('dark');

    expect(useSettingsStore.getState().marketColors).toBe('red-up');
    useSettingsStore.getState().toggleMarketColors();
    expect(useSettingsStore.getState().marketColors).toBe('green-up');
  });

  it('updates defaults independently', () => {
    useSettingsStore.getState().setDefaultAssetClass('etf');
    useSettingsStore.getState().setDefaultTimeRange('1Y');
    useSettingsStore.getState().setNumberFormat('standard');
    useSettingsStore.getState().setBaseCurrency('CNY');
    useSettingsStore.getState().setSidebarCollapsed(true);

    const state = useSettingsStore.getState();
    expect(state.defaultAssetClass).toBe('etf');
    expect(state.defaultTimeRange).toBe('1Y');
    expect(state.numberFormat).toBe('standard');
    expect(state.baseCurrency).toBe('CNY');
    expect(state.sidebarCollapsed).toBe(true);
  });

  it('restores every default on reset', () => {
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().setBaseCurrency('EUR');
    useSettingsStore.getState().reset();

    const state = useSettingsStore.getState();
    expect(state.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(state.baseCurrency).toBe(DEFAULT_SETTINGS.baseCurrency);
    expect(state.defaultTimeRange).toBe(DEFAULT_SETTINGS.defaultTimeRange);
  });

  it('rehydrates saved preferences after a simulated reload', async () => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        state: {
          theme: 'light',
          marketColors: 'green-up',
          defaultAssetClass: 'crypto',
          defaultTimeRange: '6M',
          numberFormat: 'standard',
          baseCurrency: 'EUR',
          sidebarCollapsed: true,
        },
        version: 1,
      }),
    );
    await useSettingsStore.persist.rehydrate();

    const state = useSettingsStore.getState();
    expect(state.theme).toBe('light');
    expect(state.marketColors).toBe('green-up');
    expect(state.defaultAssetClass).toBe('crypto');
    expect(state.defaultTimeRange).toBe('6M');
    expect(state.baseCurrency).toBe('EUR');
  });

  it('applies both theme axes to the document element', () => {
    applyThemeToDocument('light', 'green-up');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-market-colors')).toBe('green-up');

    applyThemeToDocument('dark', 'red-up');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-market-colors')).toBe('red-up');
  });
});
