import { describe, expect, it } from 'vitest';
import {
  applyTransaction,
  buildLedger,
  computePortfolio,
  validateTransaction,
} from '@/utils/portfolio';
import type { PortfolioTransaction, Quote } from '@/types';

const empty = (symbol = 'AAPL') => ({ symbol, quantity: 0, averageCost: 0, costBasis: 0 });

const trade = (
  id: string,
  side: 'BUY' | 'SELL',
  quantity: number,
  price: number,
  fee: number,
  date = '2026-03-02T15:00:00.000Z',
  symbol = 'AAPL',
): PortfolioTransaction => ({
  id,
  symbol,
  side,
  quantity,
  price,
  fee,
  date,
  note: '',
});

const quote = (symbol: string, price: number, previousClose: number): Quote => ({
  symbol,
  price,
  previousClose,
  change: price - previousClose,
  changePercent: ((price - previousClose) / previousClose) * 100,
  open: previousClose,
  high: Math.max(price, previousClose),
  low: Math.min(price, previousClose),
  volume: 1_000_000,
  marketCap: 50_000_000_000,
  updatedAt: '2026-10-23T19:42:00.000Z',
});

describe('applyTransaction — moving weighted-average cost', () => {
  it('capitalises the buy fee into the cost basis', () => {
    const next = applyTransaction(empty(), {
      symbol: 'AAPL',
      side: 'BUY',
      quantity: 10,
      price: 100,
      fee: 5,
      date: '2026-03-02',
    });
    expect(next.quantity).toBe(10);
    expect(next.costBasis).toBeCloseTo(1005, 6);
    expect(next.averageCost).toBeCloseTo(100.5, 6);
  });

  it('recomputes the weighted average on a second buy', () => {
    const first = applyTransaction(empty(), {
      symbol: 'AAPL',
      side: 'BUY',
      quantity: 10,
      price: 100,
      fee: 0,
      date: '2026-03-02',
    });
    const second = applyTransaction(first, {
      symbol: 'AAPL',
      side: 'BUY',
      quantity: 10,
      price: 120,
      fee: 0,
      date: '2026-03-03',
    });
    expect(second.quantity).toBe(20);
    expect(second.averageCost).toBeCloseTo(110, 6);
  });

  it('keeps the average cost on a partial sale and reduces the basis', () => {
    const held = { symbol: 'AAPL', quantity: 10, averageCost: 100.5, costBasis: 1005 };
    const next = applyTransaction(held, {
      symbol: 'AAPL',
      side: 'SELL',
      quantity: 4,
      price: 120,
      fee: 2,
      date: '2026-03-04',
    });
    expect(next.quantity).toBe(6);
    expect(next.averageCost).toBeCloseTo(100.5, 6);
    expect(next.costBasis).toBeCloseTo(603, 6);
  });

  it('clears the position on a full sale', () => {
    const held = { symbol: 'AAPL', quantity: 6, averageCost: 100.5, costBasis: 603 };
    const next = applyTransaction(held, {
      symbol: 'AAPL',
      side: 'SELL',
      quantity: 6,
      price: 90,
      fee: 1,
      date: '2026-03-05',
    });
    expect(next.quantity).toBe(0);
    expect(next.averageCost).toBe(0);
    expect(next.costBasis).toBe(0);
  });

  it('rejects overselling', () => {
    const held = { symbol: 'AAPL', quantity: 6, averageCost: 100.5, costBasis: 603 };
    expect(() =>
      applyTransaction(held, {
        symbol: 'AAPL',
        side: 'SELL',
        quantity: 7,
        price: 90,
        fee: 1,
        date: '2026-03-05',
      }),
    ).toThrow(/Cannot sell/);
  });

  it('rejects non-positive quantity, non-positive price and negative fees', () => {
    const base = { symbol: 'AAPL', side: 'BUY' as const, price: 100, fee: 0, date: '2026-03-02' };
    expect(() => applyTransaction(empty(), { ...base, quantity: 0 })).toThrow(/Quantity/);
    expect(() => applyTransaction(empty(), { ...base, quantity: 1, price: 0 })).toThrow(/Price/);
    expect(() => applyTransaction(empty(), { ...base, quantity: 1, fee: -1 })).toThrow(/Fee/);
  });
});

describe('buildLedger', () => {
  it('tracks cash, fees and realised P&L across a round trip', () => {
    const ledger = buildLedger(
      [trade('t1', 'BUY', 10, 100, 5), trade('t2', 'SELL', 4, 120, 2, '2026-03-04T15:00:00.000Z')],
      10_000,
    );

    expect(ledger.cash).toBeCloseTo(9473, 2);
    expect(ledger.feesPaid).toBeCloseTo(7, 2);
    expect(ledger.realizedPnl).toBeCloseTo(76, 2);
    expect(ledger.positions).toHaveLength(1);
    expect(ledger.positions[0].quantity).toBe(6);
    expect(ledger.positions[0].costBasis).toBeCloseTo(603, 2);
  });

  it('drops fully closed positions', () => {
    const ledger = buildLedger(
      [trade('t1', 'BUY', 5, 50, 0), trade('t2', 'SELL', 5, 60, 0, '2026-03-04T15:00:00.000Z')],
      1_000,
    );
    expect(ledger.positions).toHaveLength(0);
    expect(ledger.cash).toBeCloseTo(1050, 2);
    expect(ledger.realizedPnl).toBeCloseTo(50, 2);
  });

  it('applies transactions in chronological order regardless of input order', () => {
    const ledger = buildLedger(
      [trade('t2', 'SELL', 5, 60, 0, '2026-03-04T15:00:00.000Z'), trade('t1', 'BUY', 5, 50, 0)],
      1_000,
    );
    expect(ledger.realizedPnl).toBeCloseTo(50, 2);
    expect(ledger.cash).toBeCloseTo(1050, 2);
  });
});

describe('computePortfolio', () => {
  const transactions = [
    trade('t1', 'BUY', 10, 100, 5),
    trade('t2', 'SELL', 4, 120, 2, '2026-03-04T15:00:00.000Z'),
  ];
  const quotes = { AAPL: quote('AAPL', 110, 108) };

  it('separates realised and unrealised P&L', () => {
    const portfolio = computePortfolio(transactions, 10_000, quotes);
    expect(portfolio.realizedPnl).toBeCloseTo(76, 2);
    expect(portfolio.unrealizedPnl).toBeCloseTo(57, 2);
    expect(portfolio.marketValue).toBeCloseTo(660, 2);
    expect(portfolio.totalValue).toBeCloseTo(10_133, 2);
    expect(portfolio.totalPnl).toBeCloseTo(133, 2);
  });

  it('keeps cash consistent with buys, sells and fees', () => {
    const portfolio = computePortfolio(transactions, 10_000, quotes);
    expect(portfolio.cash).toBeCloseTo(9_473, 2);
    expect(portfolio.cash + portfolio.marketValue).toBeCloseTo(portfolio.totalValue, 2);
  });

  it('computes day P&L from the previous close', () => {
    const portfolio = computePortfolio(transactions, 10_000, quotes);
    expect(portfolio.dayPnl).toBeCloseTo((110 - 108) * 6, 2);
  });

  it('computes holding weight against total market value', () => {
    const portfolio = computePortfolio(transactions, 10_000, quotes);
    expect(portfolio.holdings[0].weight).toBeCloseTo(100, 2);
  });
});

describe('validateTransaction', () => {
  const existing = [trade('t1', 'BUY', 10, 100, 0)];

  it('accepts a valid buy', () => {
    const result = validateTransaction(
      { symbol: 'AAPL', side: 'BUY', quantity: 1, price: 100, fee: 0, date: '2026-03-05' },
      existing,
      5_000,
    );
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('rejects a buy that exceeds available demo cash', () => {
    const result = validateTransaction(
      { symbol: 'AAPL', side: 'BUY', quantity: 100, price: 100, fee: 0, date: '2026-03-05' },
      existing,
      5_000,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.cash).toBeTruthy();
  });

  it('rejects selling more than the current position', () => {
    const result = validateTransaction(
      { symbol: 'AAPL', side: 'SELL', quantity: 11, price: 100, fee: 0, date: '2026-03-05' },
      existing,
      5_000,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.position).toContain('cannot sell');
  });

  it('rejects illegal quantity, price, fee and missing date', () => {
    const result = validateTransaction(
      { symbol: 'AAPL', side: 'BUY', quantity: -1, price: 0, fee: -3, date: '' },
      existing,
      5_000,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.quantity).toBeTruthy();
    expect(result.errors.price).toBeTruthy();
    expect(result.errors.fee).toBeTruthy();
    expect(result.errors.date).toBeTruthy();
  });

  it('requires a symbol', () => {
    const result = validateTransaction(
      { symbol: '', side: 'BUY', quantity: 1, price: 10, fee: 0, date: '2026-03-05' },
      existing,
      5_000,
    );
    expect(result.errors.symbol).toBeTruthy();
  });
});
