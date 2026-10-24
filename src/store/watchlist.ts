import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_WATCHLIST } from '@/mocks/universe';

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => boolean;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => boolean;
  has: (symbol: string) => boolean;
  clear: () => void;
  reset: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [...DEFAULT_WATCHLIST],
      add: (symbol) => {
        const ticker = symbol.toUpperCase();
        if (get().symbols.includes(ticker)) return false;
        set({ symbols: [...get().symbols, ticker] });
        return true;
      },
      remove: (symbol) => {
        const ticker = symbol.toUpperCase();
        set({ symbols: get().symbols.filter((item) => item !== ticker) });
      },
      toggle: (symbol) => {
        const ticker = symbol.toUpperCase();
        const exists = get().symbols.includes(ticker);
        if (exists) {
          set({ symbols: get().symbols.filter((item) => item !== ticker) });
          return false;
        }
        set({ symbols: [...get().symbols, ticker] });
        return true;
      },
      has: (symbol) => get().symbols.includes(symbol.toUpperCase()),
      clear: () => set({ symbols: [] }),
      reset: () => set({ symbols: [...DEFAULT_WATCHLIST] }),
    }),
    {
      name: 'finscope.watchlist.v1',
      version: 1,
      partialize: (state) => ({ symbols: state.symbols }),
    },
  ),
);
