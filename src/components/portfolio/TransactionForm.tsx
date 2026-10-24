import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { usePortfolioStore } from '@/store/portfolio';
import { toastError, toastSuccess } from '@/store/toast';
import { getAssetsWithQuotes, getQuoteMap, getTodayLabel } from '@/services/data';
import { computePortfolio, validateTransaction } from '@/utils/portfolio';
import type { TransactionInput, TransactionValidation } from '@/utils/portfolio';
import { useFormatters } from '@/hooks/useFormatters';
import type { PortfolioTransaction } from '@/types';

interface TransactionFormProps {
  open: boolean;
  editing?: PortfolioTransaction | null;
  onClose: () => void;
}

const EMPTY: TransactionValidation['errors'] = {};

export function TransactionForm({ open, editing = null, onClose }: TransactionFormProps) {
  const assets = useMemo(
    () => getAssetsWithQuotes().filter((row) => row.asset.class !== 'index'),
    [],
  );
  const transactions = usePortfolioStore((state) => state.transactions);
  const startingCash = usePortfolioStore((state) => state.startingCash);
  const addTransaction = usePortfolioStore((state) => state.addTransaction);
  const updateTransaction = usePortfolioStore((state) => state.updateTransaction);
  const formatters = useFormatters();
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState('10');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(getTodayLabel());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<TransactionValidation['errors']>(EMPTY);

  const quote = getQuoteMap()[symbol];
  const others = useMemo(
    () => transactions.filter((tx) => tx.id !== editing?.id),
    [transactions, editing],
  );
  const preview = useMemo(
    () => computePortfolio(others, startingCash, getQuoteMap()),
    [others, startingCash],
  );
  const held = preview.holdings.find((holding) => holding.symbol === symbol)?.quantity ?? 0;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setSide(editing.side);
      setSymbol(editing.symbol);
      setQuantity(String(editing.quantity));
      setPrice(String(editing.price));
      setFee(String(editing.fee));
      setDate(editing.date.slice(0, 10));
      setNote(editing.note ?? '');
    } else {
      const defaultQuote = getQuoteMap()['AAPL'];
      setSide('BUY');
      setSymbol('AAPL');
      setQuantity('10');
      setPrice(defaultQuote ? defaultQuote.price.toFixed(2) : '');
      setFee('0');
      setDate(getTodayLabel());
      setNote('');
    }
    setErrors(EMPTY);
    window.setTimeout(() => firstFieldRef.current?.focus(), 40);
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSymbolChange = (next: string) => {
    setSymbol(next);
    const nextQuote = getQuoteMap()[next];
    if (nextQuote) setPrice(nextQuote.price.toFixed(2));
    setErrors(EMPTY);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: TransactionInput = {
      symbol,
      side,
      quantity: Number(quantity),
      price: Number(price),
      fee: Number(fee || 0),
      date: `${date}T12:00:00.000Z`,
      note: note.trim() || undefined,
    };

    const result = validateTransaction(input, others, preview.cash);
    setErrors(result.errors);
    if (!result.ok) {
      const first = Object.values(result.errors)[0] ?? 'Check the highlighted fields';
      toastError('Order rejected', first);
      return;
    }

    try {
      if (editing) {
        updateTransaction(editing.id, input);
        toastSuccess('Transaction updated', `${side} ${quantity} ${symbol} on ${date}`);
      } else {
        addTransaction(input);
        toastSuccess(
          'Transaction recorded',
          `${side} ${quantity} ${symbol} at ${formatters.money(Number(price))}`,
        );
      }
      onClose();
    } catch (error) {
      toastError('Order rejected', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const fieldError = (key: keyof TransactionValidation['errors']) =>
    errors[key] ? <p className="mt-1 text-2xs text-danger">{errors[key]}</p> : null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close transaction form"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-title"
        className="animate-slide-up relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-lg border border-border bg-panel shadow-pop sm:rounded-lg"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            <h2 id="transaction-title" className="text-sm font-semibold text-fg">
              {editing ? 'Edit transaction' : 'Add transaction'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Demo ledger only — balances are stored in this browser.
            </p>
          </div>
          <button type="button" className="fs-icon-btn h-8 w-8" aria-label="Close" onClick={onClose}>
            <X size={15} />
          </button>
        </header>

        <form className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            {(['BUY', 'SELL'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSide(option);
                  setErrors(EMPTY);
                }}
                aria-pressed={side === option}
                className={clsx(
                  'h-9 rounded border text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
                  side === option
                    ? option === 'BUY'
                      ? 'border-accent/50 bg-accent-soft text-accent'
                      : 'border-warn/50 bg-warn/10 text-warn'
                    : 'border-border bg-panel-2 text-muted hover:text-fg',
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div>
            <label className="fs-label" htmlFor="tx-symbol">
              Asset
            </label>
            <select
              id="tx-symbol"
              ref={firstFieldRef}
              className="fs-select mt-1"
              value={symbol}
              onChange={(event) => handleSymbolChange(event.target.value)}
            >
              {assets.map((row) => (
                <option key={row.asset.symbol} value={row.asset.symbol}>
                  {row.asset.symbol} — {row.asset.name}
                </option>
              ))}
            </select>
            {fieldError('symbol')}
            <p className="mt-1 text-2xs text-subtle">
              {side === 'SELL'
                ? `Available to sell: ${held} ${symbol}`
                : `Available cash: ${formatters.money(preview.cash)} · quote ${quote ? formatters.money(quote.price) : '—'}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fs-label" htmlFor="tx-quantity">
                Quantity
              </label>
              <input
                id="tx-quantity"
                className="fs-input fs-num mt-1"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              {fieldError('quantity')}
            </div>
            <div>
              <label className="fs-label" htmlFor="tx-price">
                Price (USD)
              </label>
              <input
                id="tx-price"
                className="fs-input fs-num mt-1"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
              {fieldError('price')}
            </div>
            <div>
              <label className="fs-label" htmlFor="tx-fee">
                Fee (USD)
              </label>
              <input
                id="tx-fee"
                className="fs-input fs-num mt-1"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={fee}
                onChange={(event) => setFee(event.target.value)}
              />
              {fieldError('fee')}
            </div>
            <div>
              <label className="fs-label" htmlFor="tx-date">
                Trade date
              </label>
              <input
                id="tx-date"
                className="fs-input fs-num mt-1"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              {fieldError('date')}
            </div>
          </div>

          <div>
            <label className="fs-label" htmlFor="tx-note">
              Note <span className="normal-case tracking-normal text-subtle">(optional)</span>
            </label>
            <input
              id="tx-note"
              className="fs-input mt-1"
              type="text"
              maxLength={80}
              placeholder="e.g. trim position after earnings"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          {errors.position ? (
            <p className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {errors.position}
            </p>
          ) : null}
          {errors.cash ? (
            <p className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {errors.cash}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="fs-num text-2xs text-muted">
              Est. total{' '}
              <span className="text-fg">
                {formatters.money((Number(quantity) || 0) * (Number(price) || 0) + (Number(fee) || 0))}
              </span>
            </p>
            <div className="flex gap-2">
              <button type="button" className="fs-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="fs-btn fs-btn-primary">
                {editing ? 'Save changes' : 'Record transaction'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
