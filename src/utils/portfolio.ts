import type { Holding, Portfolio, PortfolioTransaction, Quote } from '@/types';
import { roundTo } from '@/utils/format';

export interface TransactionInput {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  date: string;
  note?: string;
}

export interface PositionState {
  symbol: string;
  quantity: number;
  averageCost: number;
  costBasis: number;
}

/**
 * Moving weighted-average cost basis.
 * - Buy fees are capitalised into cost basis.
 * - Sell fees reduce realised proceeds.
 */
export function applyTransaction(position: PositionState, tx: TransactionInput): PositionState {
  const { quantity, price, fee } = tx;
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than 0');
  if (!Number.isFinite(price) || price <= 0) throw new Error('Price must be greater than 0');
  if (!Number.isFinite(fee) || fee < 0) throw new Error('Fee cannot be negative');

  if (tx.side === 'BUY') {
    const newQty = position.quantity + quantity;
    const newBasis = position.quantity * position.averageCost + quantity * price + fee;
    return {
      symbol: tx.symbol,
      quantity: newQty,
      averageCost: newQty === 0 ? 0 : newBasis / newQty,
      costBasis: newBasis,
    };
  }

  if (quantity > position.quantity + 1e-9) {
    throw new Error(`Cannot sell ${quantity} — only ${position.quantity} held`);
  }
  const newQty = Math.max(0, position.quantity - quantity);
  const newBasis = newQty === 0 ? 0 : position.averageCost * newQty;
  return {
    symbol: tx.symbol,
    quantity: newQty,
    averageCost: newQty === 0 ? 0 : position.averageCost,
    costBasis: newBasis,
  };
}

export function sortTransactions(transactions: PortfolioTransaction[]): PortfolioTransaction[] {
  return [...transactions].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}

export interface LedgerResult {
  positions: PositionState[];
  cash: number;
  realizedPnl: number;
  feesPaid: number;
}

export function buildLedger(transactions: PortfolioTransaction[], startingCash: number): LedgerResult {
  const positions = new Map<string, PositionState>();
  let cash = startingCash;
  let realizedPnl = 0;
  let feesPaid = 0;

  for (const tx of sortTransactions(transactions)) {
    const current = positions.get(tx.symbol) ?? {
      symbol: tx.symbol,
      quantity: 0,
      averageCost: 0,
      costBasis: 0,
    };
    const next = applyTransaction(current, tx);
    if (tx.side === 'BUY') {
      cash -= tx.quantity * tx.price + tx.fee;
    } else {
      realizedPnl += tx.quantity * (tx.price - current.averageCost) - tx.fee;
      cash += tx.quantity * tx.price - tx.fee;
    }
    feesPaid += tx.fee;
    positions.set(tx.symbol, next);
  }

  return {
    positions: [...positions.values()].filter((p) => p.quantity > 1e-9),
    cash: roundTo(cash, 2),
    realizedPnl: roundTo(realizedPnl, 2),
    feesPaid: roundTo(feesPaid, 2),
  };
}

export function buildHoldings(
  positions: PositionState[],
  quoteMap: Record<string, Quote>,
  marketValueTotal: number,
): Holding[] {
  return positions.map((position) => {
    const quote = quoteMap[position.symbol];
    const price = quote?.price ?? position.averageCost;
    const marketValue = price * position.quantity;
    const costBasis = position.costBasis;
    const unrealizedPnl = marketValue - costBasis;
    return {
      symbol: position.symbol,
      quantity: position.quantity,
      averageCost: position.averageCost,
      marketValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPercent: costBasis === 0 ? 0 : (unrealizedPnl / costBasis) * 100,
      weight: marketValueTotal === 0 ? 0 : (marketValue / marketValueTotal) * 100,
    };
  });
}

export function computePortfolio(
  transactions: PortfolioTransaction[],
  startingCash: number,
  quoteMap: Record<string, Quote>,
  history: Array<{ date: string; value: number }> = [],
): Portfolio {
  const ledger = buildLedger(transactions, startingCash);
  const marketValue = ledger.positions.reduce((sum, p) => {
    const price = quoteMap[p.symbol]?.price ?? p.averageCost;
    return sum + price * p.quantity;
  }, 0);
  const holdings = buildHoldings(ledger.positions, quoteMap, marketValue);
  const unrealizedPnl = holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
  const dayPnl = holdings.reduce((sum, h) => {
    const quote = quoteMap[h.symbol];
    if (!quote) return sum;
    return sum + (quote.price - quote.previousClose) * h.quantity;
  }, 0);
  const totalValue = marketValue + ledger.cash;

  return {
    cash: ledger.cash,
    startingCash,
    transactions: sortTransactions(transactions),
    holdings: holdings.map((h) => ({
      ...h,
      marketValue: roundTo(h.marketValue, 2),
      averageCost: roundTo(h.averageCost, 4),
      costBasis: roundTo(h.costBasis, 2),
      unrealizedPnl: roundTo(h.unrealizedPnl, 2),
      unrealizedPnlPercent: roundTo(h.unrealizedPnlPercent, 2),
      weight: roundTo(h.weight, 2),
    })),
    marketValue: roundTo(marketValue, 2),
    totalValue: roundTo(totalValue, 2),
    dayPnl: roundTo(dayPnl, 2),
    totalPnl: roundTo(totalValue - startingCash, 2),
    realizedPnl: ledger.realizedPnl,
    unrealizedPnl: roundTo(unrealizedPnl, 2),
    history,
  };
}

export interface TransactionValidation {
  ok: boolean;
  errors: Partial<Record<'symbol' | 'quantity' | 'price' | 'fee' | 'date' | 'cash' | 'position', string>>;
}

export function validateTransaction(
  input: TransactionInput,
  transactions: PortfolioTransaction[],
  availableCash: number,
): TransactionValidation {
  const errors: TransactionValidation['errors'] = {};
  if (!input.symbol) errors.symbol = 'Select an asset';
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
  if (!Number.isFinite(input.price) || input.price <= 0) errors.price = 'Price must be greater than 0';
  if (!Number.isFinite(input.fee) || input.fee < 0) errors.fee = 'Fee cannot be negative';
  if (!input.date) errors.date = 'Date is required';

  if (input.side === 'SELL' && input.symbol) {
    const ledger = buildLedger(transactions, 0);
    const held = ledger.positions.find((p) => p.symbol === input.symbol)?.quantity ?? 0;
    if (input.quantity > held + 1e-9) {
      errors.position = `You hold ${held} ${input.symbol}; cannot sell ${input.quantity}`;
    }
  }

  if (input.side === 'BUY') {
    const cost = input.quantity * input.price + input.fee;
    if (Number.isFinite(cost) && cost > availableCash + 1e-9) {
      errors.cash = 'Insufficient demo cash for this order';
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
