import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioTransaction } from '@/types';
import { DEMO_TRANSACTIONS, STARTING_CASH } from '@/mocks/portfolio';
import { sortTransactions } from '@/utils/portfolio';

export type TransactionDraft = Omit<PortfolioTransaction, 'id'> & { id?: string };

interface PortfolioState {
  transactions: PortfolioTransaction[];
  startingCash: number;
  addTransaction: (draft: TransactionDraft) => PortfolioTransaction;
  updateTransaction: (id: string, draft: TransactionDraft) => void;
  deleteTransaction: (id: string) => void;
  reset: () => void;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `tx-${crypto.randomUUID()}`;
  return `tx-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      transactions: [...DEMO_TRANSACTIONS],
      startingCash: STARTING_CASH,
      addTransaction: (draft) => {
        const transaction: PortfolioTransaction = { ...draft, id: draft.id ?? createId() };
        set({ transactions: sortTransactions([...get().transactions, transaction]) });
        return transaction;
      },
      updateTransaction: (id, draft) => {
        const next = get().transactions.map((tx) =>
          tx.id === id ? ({ ...draft, id } as PortfolioTransaction) : tx,
        );
        set({ transactions: sortTransactions(next) });
      },
      deleteTransaction: (id) => {
        set({ transactions: get().transactions.filter((tx) => tx.id !== id) });
      },
      reset: () => set({ transactions: [...DEMO_TRANSACTIONS], startingCash: STARTING_CASH }),
    }),
    {
      name: 'finscope.portfolio.v1',
      version: 1,
      partialize: (state) => ({
        transactions: state.transactions,
        startingCash: state.startingCash,
      }),
    },
  ),
);
