import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, RotateCcw, Trash2, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { TransactionForm } from '@/components/portfolio/TransactionForm';
import { AssetAllocationChart } from '@/components/charts/AssetAllocationChart';
import type { AllocationSlice } from '@/components/charts/AssetAllocationChart';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { usePortfolioStore } from '@/store/portfolio';
import { toastInfo, toastSuccess } from '@/store/toast';
import { getAssetBySymbol, getPortfolio, getQuoteMap } from '@/services/data';
import { useFormatters } from '@/hooks/useFormatters';
import { useChartTheme } from '@/hooks/useChartTheme';
import { assetDecimals, formatPercent } from '@/utils/format';
import type { PortfolioTransaction } from '@/types';

const ALLOCATION_PALETTE = [
  '#4F8CFF',
  '#F5B942',
  '#22A06B',
  '#A78BFA',
  '#F472B6',
  '#38BDF8',
  '#FB923C',
  '#94A3B8',
];

export default function PortfolioPage() {
  const transactions = usePortfolioStore((state) => state.transactions);
  const reset = usePortfolioStore((state) => state.reset);
  const deleteTransaction = usePortfolioStore((state) => state.deleteTransaction);
  const formatters = useFormatters();
  const chartTheme = useChartTheme();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioTransaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PortfolioTransaction | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const portfolio = useMemo(() => getPortfolio(transactions), [transactions]);
  const quotes = getQuoteMap();

  const history = portfolio.history;
  const labels = history.map((point) => point.date);
  const values = history.map((point) => point.value);

  const slices = useMemo<AllocationSlice[]>(() => {
    const positionSlices = portfolio.holdings.map((holding, index) => ({
      name: holding.symbol,
      value: holding.marketValue,
      color: ALLOCATION_PALETTE[index % ALLOCATION_PALETTE.length],
    }));
    const cashSlice: AllocationSlice = {
      name: 'Cash',
      value: portfolio.cash,
      color: chartTheme.muted,
    };
    return [...positionSlices, cashSlice].filter((slice) => slice.value > 0);
  }, [portfolio.holdings, portfolio.cash, chartTheme.muted]);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        return byDate !== 0 ? byDate : b.id.localeCompare(a.id);
      }),
    [transactions],
  );

  const feesPaid = useMemo(
    () => transactions.reduce((sum, tx) => sum + (Number.isFinite(tx.fee) ? tx.fee : 0), 0),
    [transactions],
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (transaction: PortfolioTransaction) => {
    setEditing(transaction);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteTransaction(pendingDelete.id);
    toastInfo('Transaction removed', `${pendingDelete.side} ${pendingDelete.symbol} was deleted.`);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-fg">Portfolio</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 text-xs text-muted">
            Simulated ledger with a {formatters.money(portfolio.startingCash)} starting balance. Positions,
            cash and P&amp;L are stored in this browser — never synced to a broker.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="fs-btn h-9" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={13} /> Reset demo
          </button>
          <button type="button" className="fs-btn fs-btn-primary h-9" onClick={openAdd}>
            <Plus size={14} /> Add transaction
          </button>
        </div>
      </header>

      <DemoDataBadge variant="banner" message="DEMO PORTFOLIO — SIMULATED LEDGER, NOT A BROKER ACCOUNT" />

      <PortfolioSummary portfolio={portfolio} />

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Equity curve"
          subtitle={`Portfolio value over the last ${history.length} trading days (demo close prices)`}
          bodyClassName="p-3 pt-2"
        >
          {values.length > 1 ? (
            <PerformanceChart
              labels={labels}
              series={[{ name: 'Portfolio value', values, area: true, color: chartTheme.accent }]}
              height={280}
              decimals={0}
              ariaLabel="Demo portfolio equity curve"
            />
          ) : (
            <EmptyState
              title="Not enough history yet"
              description="Add a few transactions to build the demo equity curve."
            />
          )}
        </Panel>

        <Panel title="Allocation" subtitle="Market value plus settlement cash">
          {slices.length === 0 ? (
            <EmptyState title="No positions" description="Add a buy transaction to see the allocation." />
          ) : (
            <>
              <AssetAllocationChart slices={slices} total={portfolio.totalValue} height={220} />
              <ul className="mt-2 space-y-1">
                {slices.map((slice) => {
                  const percent = portfolio.totalValue === 0 ? 0 : (slice.value / portfolio.totalValue) * 100;
                  return (
                    <li key={slice.name} className="flex items-center gap-2 text-2xs">
                      <span
                        className="h-2 w-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: slice.color }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate text-muted">{slice.name}</span>
                      <span className="fs-num shrink-0 text-fg">{formatters.money(slice.value)}</span>
                      <span className="fs-num w-10 shrink-0 text-right text-muted">
                        {percent.toFixed(1)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Panel>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ledger totals">
        <LedgerStat label="Realized P&L" value={formatters.signed(portfolio.realizedPnl, 2)} tone={portfolio.realizedPnl} />
        <LedgerStat
          label="Unrealized P&L"
          value={formatters.signed(portfolio.unrealizedPnl, 2)}
          tone={portfolio.unrealizedPnl}
        />
        <LedgerStat label="Fees paid" value={formatters.money(feesPaid)} />
        <LedgerStat label="Transactions" value={String(transactions.length)} />
      </section>

      <Panel
        title="Holdings"
        subtitle={`${portfolio.holdings.length} open ${portfolio.holdings.length === 1 ? 'position' : 'positions'} · moving weighted-average cost`}
        flush
      >
        {portfolio.holdings.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Wallet size={18} />}
              title="No open positions"
              description="Record a buy transaction to start building this demo portfolio."
              action={
                <button type="button" className="fs-btn fs-btn-primary h-9" onClick={openAdd}>
                  <Plus size={14} /> Add transaction
                </button>
              }
            />
          </div>
        ) : (
          <div className="fs-scroll-x">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-panel-2/40">
                  <th className="fs-th text-left">Asset</th>
                  <th className="fs-th text-right">Quantity</th>
                  <th className="fs-th text-right">Avg cost</th>
                  <th className="fs-th text-right">Price</th>
                  <th className="fs-th text-right">Market value</th>
                  <th className="fs-th text-right">Unrealized P&amp;L</th>
                  <th className="fs-th text-right">Return</th>
                  <th className="fs-th text-right">Weight</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => {
                  const quote = quotes[holding.symbol];
                  const assetClass = getAssetBySymbol(holding.symbol)?.class ?? 'stock';
                  const decimals = quote ? assetDecimals(assetClass, quote.price) : 2;
                  return (
                    <tr key={holding.symbol} className="fs-row">
                      <td className="fs-td">
                        <Link to={`/assets/${holding.symbol}`} className="block min-w-0">
                          <span className="block truncate text-xs font-semibold text-fg hover:text-accent">
                            {holding.symbol}
                          </span>
                          <span className="block truncate text-2xs text-muted">
                            {holding.quantity} shares held
                          </span>
                        </Link>
                      </td>
                      <td className="fs-td fs-num text-right">{holding.quantity}</td>
                      <td className="fs-td fs-num text-right">
                        {formatters.price(holding.averageCost, decimals)}
                      </td>
                      <td className="fs-td fs-num text-right">
                        {quote ? formatters.price(quote.price, decimals) : '—'}
                      </td>
                      <td className="fs-td fs-num text-right">{formatters.money(holding.marketValue)}</td>
                      <td
                        className={clsx(
                          'fs-td fs-num text-right',
                          holding.unrealizedPnl > 0
                            ? 'text-up'
                            : holding.unrealizedPnl < 0
                              ? 'text-down'
                              : 'text-muted',
                        )}
                      >
                        {formatters.signed(holding.unrealizedPnl, 2)}
                      </td>
                      <td
                        className={clsx(
                          'fs-td fs-num text-right',
                          holding.unrealizedPnlPercent > 0
                            ? 'text-up'
                            : holding.unrealizedPnlPercent < 0
                              ? 'text-down'
                              : 'text-muted',
                        )}
                      >
                        {formatPercent(holding.unrealizedPnlPercent, 2)}
                      </td>
                      <td className="fs-td text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="fs-num text-2xs text-muted">{holding.weight.toFixed(1)}%</span>
                          <span className="h-1 w-12 overflow-hidden rounded-full bg-panel-3" aria-hidden>
                            <span
                              className="block h-full rounded-full bg-accent"
                              style={{ width: `${Math.min(100, holding.weight)}%` }}
                            />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel
        title="Transaction history"
        subtitle="Newest first · every edit recalculates cost basis and cash"
        flush
        actions={
          <button type="button" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs" onClick={openAdd}>
            <Plus size={12} /> New
          </button>
        }
      >
        {sortedTransactions.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No transactions yet"
              description="Record your first demo buy to start the ledger."
              action={
                <button type="button" className="fs-btn fs-btn-primary h-9" onClick={openAdd}>
                  <Plus size={14} /> Add transaction
                </button>
              }
            />
          </div>
        ) : (
          <div className="fs-scroll-x">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-panel-2/40">
                  <th className="fs-th text-left">Date</th>
                  <th className="fs-th text-left">Side</th>
                  <th className="fs-th text-left">Asset</th>
                  <th className="fs-th text-right">Quantity</th>
                  <th className="fs-th text-right">Price</th>
                  <th className="fs-th text-right">Fee</th>
                  <th className="fs-th text-right">Total</th>
                  <th className="fs-th text-left">Note</th>
                  <th className="fs-th w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((tx) => {
                  const total = tx.quantity * tx.price + tx.fee;
                  return (
                    <tr key={tx.id} className="fs-row">
                      <td className="fs-td fs-num whitespace-nowrap">{tx.date.slice(0, 10)}</td>
                      <td className="fs-td">
                        <span
                          className={clsx(
                            'inline-flex items-center rounded px-1.5 py-0.5 text-2xs font-semibold',
                            tx.side === 'BUY' ? 'bg-accent-soft text-accent' : 'bg-warn/10 text-warn',
                          )}
                        >
                          {tx.side}
                        </span>
                      </td>
                      <td className="fs-td">
                        <Link to={`/assets/${tx.symbol}`} className="text-xs font-semibold text-fg hover:text-accent">
                          {tx.symbol}
                        </Link>
                      </td>
                      <td className="fs-td fs-num text-right">{tx.quantity}</td>
                      <td className="fs-td fs-num text-right">{formatters.price(tx.price, 2)}</td>
                      <td className="fs-td fs-num text-right">{formatters.money(tx.fee)}</td>
                      <td className="fs-td fs-num text-right text-fg">{formatters.money(total)}</td>
                      <td className="fs-td max-w-[180px] truncate text-2xs text-muted">{tx.note ?? '—'}</td>
                      <td className="fs-td text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="fs-icon-btn h-7 w-7"
                            aria-label={`Edit ${tx.side} ${tx.symbol}`}
                            onClick={() => openEdit(tx)}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            className="fs-icon-btn h-7 w-7"
                            aria-label={`Delete ${tx.side} ${tx.symbol}`}
                            onClick={() => setPendingDelete(tx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-2xs text-subtle">
        Cost basis uses the moving weighted-average method. Sells can never exceed the quantity held, fees are
        tracked separately, and realized P&amp;L excludes unrealized gains. Balances live only in this browser.
      </p>

      <TransactionForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this transaction?"
        description={
          pendingDelete
            ? `${pendingDelete.side} ${pendingDelete.quantity} ${pendingDelete.symbol} on ${pendingDelete.date.slice(0, 10)} will be removed and the ledger recalculated.`
            : undefined
        }
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset the demo portfolio?"
        description="All transactions in this browser return to the built-in demo set. Your watchlist and settings are untouched."
        confirmLabel="Reset portfolio"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          reset();
          setConfirmReset(false);
          toastSuccess('Portfolio reset', 'The built-in demo transactions were restored.');
        }}
      />
    </div>
  );
}

function LedgerStat({ label, value, tone }: { label: string; value: string; tone?: number }) {
  return (
    <div className="fs-panel min-w-0 px-4 py-3">
      <p className="fs-label">{label}</p>
      <p
        className={clsx(
          'fs-num mt-1.5 truncate text-[17px] font-semibold leading-none',
          typeof tone === 'number'
            ? tone > 0
              ? 'text-up'
              : tone < 0
                ? 'text-down'
                : 'text-fg'
            : 'text-fg',
        )}
      >
        {value}
      </p>
    </div>
  );
}
