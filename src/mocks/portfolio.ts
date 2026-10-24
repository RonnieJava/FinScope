import type { PortfolioTransaction } from '@/types';

export const STARTING_CASH = 100_000;

export const DEMO_TRANSACTIONS: PortfolioTransaction[] = [
  { id: 'tx-001', symbol: 'AAPL', side: 'BUY', quantity: 40, price: 178.2, fee: 1, date: '2026-03-12T14:32:00.000Z', note: 'Initial core position' },
  { id: 'tx-002', symbol: 'NVDA', side: 'BUY', quantity: 30, price: 112.4, fee: 1, date: '2026-04-08T15:10:00.000Z', note: 'AI infrastructure exposure' },
  { id: 'tx-003', symbol: 'SPY', side: 'BUY', quantity: 20, price: 512.3, fee: 0.5, date: '2026-05-21T16:02:00.000Z', note: 'Broad-market anchor' },
  { id: 'tx-004', symbol: 'BTC-USD', side: 'BUY', quantity: 0.35, price: 68400, fee: 12, date: '2026-06-17T18:44:00.000Z', note: 'Crypto sleeve' },
  { id: 'tx-005', symbol: 'NVDA', side: 'SELL', quantity: 10, price: 138.6, fee: 1, date: '2026-07-09T15:28:00.000Z', note: 'Trim after run-up' },
  { id: 'tx-006', symbol: 'MSFT', side: 'BUY', quantity: 12, price: 402.1, fee: 1, date: '2026-07-30T14:58:00.000Z' },
  { id: 'tx-007', symbol: 'GLD', side: 'BUY', quantity: 40, price: 228.7, fee: 1, date: '2026-08-14T17:20:00.000Z', note: 'Diversifier' },
  { id: 'tx-008', symbol: 'AAPL', side: 'SELL', quantity: 15, price: 219.8, fee: 1, date: '2026-09-03T15:45:00.000Z', note: 'Rebalance' },
  { id: 'tx-009', symbol: 'ETH-USD', side: 'BUY', quantity: 3.2, price: 3180, fee: 6, date: '2026-09-22T19:12:00.000Z' },
  { id: 'tx-010', symbol: 'TSLA', side: 'BUY', quantity: 8, price: 398.4, fee: 1, date: '2026-10-06T16:34:00.000Z' },
  { id: 'tx-011', symbol: 'SPY', side: 'SELL', quantity: 5, price: 585.2, fee: 0.5, date: '2026-10-15T14:22:00.000Z', note: 'Raise cash' },
];
