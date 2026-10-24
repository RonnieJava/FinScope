import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RECENTLY_VIEWED_SEED } from '@/mocks/universe';

interface RecentState {
  symbols: string[];
  visit: (symbol: string) => void;
  clear: () => void;
}

const MAX_RECENT = 8;

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      symbols: [...RECENTLY_VIEWED_SEED],
      visit: (symbol) => {
        const ticker = symbol.toUpperCase();
        const rest = get().symbols.filter((item) => item !== ticker);
        set({ symbols: [ticker, ...rest].slice(0, MAX_RECENT) });
      },
      clear: () => set({ symbols: [] }),
    }),
    {
      name: 'finscope.recent.v1',
      version: 1,
      partialize: (state) => ({ symbols: state.symbols }),
    },
  ),
);
