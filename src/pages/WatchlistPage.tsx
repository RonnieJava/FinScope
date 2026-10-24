import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Star, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { AssetTable } from '@/components/market/AssetTable';
import type { AssetSort, AssetSortKey } from '@/components/market/AssetTable';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAssetsWithQuotes } from '@/hooks/useAssetsWithQuotes';
import { useWatchlistStore } from '@/store/watchlist';
import { toastInfo, toastSuccess } from '@/store/toast';
import { useFormatters } from '@/hooks/useFormatters';
import { formatPercent } from '@/utils/format';
import type { AssetClass } from '@/types';

type ClassFilter = AssetClass | 'all';

const CLASS_TABS: Array<{ value: ClassFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'index', label: 'Indices' },
  { value: 'crypto', label: 'Crypto' },
];

export default function WatchlistPage() {
  const symbols = useWatchlistStore((state) => state.symbols);
  const add = useWatchlistStore((state) => state.add);
  const remove = useWatchlistStore((state) => state.remove);
  const reset = useWatchlistStore((state) => state.reset);
  const watched = useAssetsWithQuotes(symbols);
  const allRows = useAssetsWithQuotes();
  const formatters = useFormatters();

  const [query, setQuery] = useState('');
  const [assetClass, setAssetClass] = useState<ClassFilter>('all');
  const [sort, setSort] = useState<AssetSort>({ key: 'changePercent', direction: 'desc' });
  const [confirmClear, setConfirmClear] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const direction = sort.direction === 'asc' ? 1 : -1;
    return watched
      .filter((row) => (assetClass === 'all' ? true : row.asset.class === assetClass))
      .filter((row) =>
        term
          ? row.asset.symbol.toLowerCase().includes(term) || row.asset.name.toLowerCase().includes(term)
          : true,
      )
      .sort((a, b) => {
        switch (sort.key) {
          case 'symbol':
            return a.asset.symbol.localeCompare(b.asset.symbol) * direction;
          case 'name':
            return a.asset.name.localeCompare(b.asset.name) * direction;
          case 'price':
            return (a.quote.price - b.quote.price) * direction;
          case 'volume':
            return (a.quote.volume - b.quote.volume) * direction;
          default:
            return (a.quote.changePercent - b.quote.changePercent) * direction;
        }
      });
  }, [watched, assetClass, query, sort]);

  const candidates = useMemo(() => {
    const term = addQuery.trim().toLowerCase();
    return allRows
      .filter((row) => !symbols.includes(row.asset.symbol))
      .filter((row) =>
        term
          ? row.asset.symbol.toLowerCase().includes(term) || row.asset.name.toLowerCase().includes(term)
          : true,
      )
      .slice(0, 8);
  }, [allRows, addQuery, symbols]);

  const handleSort = (key: AssetSortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'symbol' || key === 'name' ? 'asc' : 'desc' },
    );
  };

  const handleAdd = (symbol: string) => {
    add(symbol);
    toastSuccess(`${symbol} added to watchlist`, 'Saved in this browser.');
    setAddQuery('');
  };

  const handleRemove = (symbol: string) => {
    remove(symbol);
    toastInfo(`${symbol} removed`, 'You can add it again at any time.');
  };

  const watchedSymbols = new Set(symbols);
  const averageChange =
    watched.length === 0
      ? 0
      : watched.reduce((sum, row) => sum + row.quote.changePercent, 0) / watched.length;

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-fg">Watchlist</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>
              {symbols.length} tracked {symbols.length === 1 ? 'asset' : 'assets'}
            </span>
            <span aria-hidden>·</span>
            <span className="fs-num">
              Avg. change{' '}
              <span
                className={clsx(
                  averageChange > 0 ? 'text-up' : averageChange < 0 ? 'text-down' : 'text-muted',
                )}
              >
                {formatPercent(averageChange, 2)}
              </span>
            </span>
            <span aria-hidden>·</span>
            <span>Saved locally in this browser</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="fs-btn fs-btn-primary h-9"
            onClick={() => setAddOpen((open) => !open)}
            aria-expanded={addOpen}
          >
            <Plus size={14} /> Add asset
          </button>
          {symbols.length > 0 ? (
            <button type="button" className="fs-btn fs-btn-danger h-9" onClick={() => setConfirmClear(true)}>
              <Trash2 size={13} /> Clear all
            </button>
          ) : null}
        </div>
      </header>

      {addOpen ? (
        <Panel
          title="Add to watchlist"
          subtitle="Search the demo universe by symbol or name"
          actions={
            <button
              type="button"
              className="fs-icon-btn h-8 w-8"
              aria-label="Close add panel"
              onClick={() => setAddOpen(false)}
            >
              <X size={14} />
            </button>
          }
        >
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              className="fs-input pl-8"
              placeholder="e.g. NVDA, Vanguard, bitcoin"
              value={addQuery}
              onChange={(event) => setAddQuery(event.target.value)}
              aria-label="Search assets to add"
              autoFocus
            />
          </div>

          {candidates.length === 0 ? (
            <p className="mt-3 text-xs text-muted">
              No more demo assets match that search — every match is already tracked.
            </p>
          ) : (
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {candidates.map(({ asset, quote }) => (
                <li key={asset.symbol}>
                  <button
                    type="button"
                    onClick={() => handleAdd(asset.symbol)}
                    className="flex w-full items-center justify-between gap-2 rounded border border-border bg-panel-2/60 px-2.5 py-2 text-left transition-colors hover:border-accent/50 hover:bg-panel-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-fg">{asset.symbol}</span>
                      <span className="block truncate text-2xs text-muted">{asset.name}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="fs-num block text-xs text-fg">
                        {formatters.price(quote.price, asset.class === 'crypto' && quote.price < 1 ? 4 : 2)}
                      </span>
                      <span
                        className={clsx(
                          'fs-num block text-2xs',
                          quote.changePercent > 0
                            ? 'text-up'
                            : quote.changePercent < 0
                              ? 'text-down'
                              : 'text-muted',
                        )}
                      >
                        {formatPercent(quote.changePercent, 2)}
                      </span>
                    </span>
                    <Plus size={13} className="shrink-0 text-accent" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}

      {symbols.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Star size={18} />}
            title="Your watchlist is empty"
            description="Star assets from Markets, or use the Add asset button above. Your list is stored in this browser and survives a refresh."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button type="button" className="fs-btn fs-btn-primary h-9" onClick={() => setAddOpen(true)}>
                  <Plus size={14} /> Add asset
                </button>
                <Link to="/markets" className="fs-btn h-9">
                  Browse markets
                </Link>
              </div>
            }
          />
        </Panel>
      ) : (
        <Panel flush>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Asset class filter">
              {CLASS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={clsx('fs-tab', assetClass === tab.value && 'fs-tab-active')}
                  aria-pressed={assetClass === tab.value}
                  onClick={() => setAssetClass(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-60">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                className="fs-input pl-8"
                placeholder="Filter your watchlist"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Filter watchlist"
              />
            </div>
          </div>

          <AssetTable
            rows={rows}
            sort={sort}
            onSort={handleSort}
            emptyTitle="No tracked assets match this filter"
            emptyDescription="Clear the filter or switch asset class to see the rest of your watchlist."
            renderActions={({ asset }) => (
              <button
                type="button"
                className="fs-icon-btn h-7 w-7"
                aria-label={`Remove ${asset.symbol} from watchlist`}
                onClick={() => handleRemove(asset.symbol)}
              >
                <X size={13} />
              </button>
            )}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
            <p className="fs-num text-2xs text-muted">
              Showing {rows.length} of {symbols.length} tracked assets
            </p>
            <p className="text-2xs text-subtle">Unwatched symbols are kept in local storage only.</p>
          </div>
        </Panel>
      )}

      {watchedSymbols.size > 0 ? (
        <p className="text-2xs text-subtle">
          Tip: use the star icon in{' '}
          <Link to="/markets" className="text-accent hover:underline">
            Markets
          </Link>{' '}
          to build this list faster.
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmClear}
        title="Clear the entire watchlist?"
        description={`This removes all ${symbols.length} tracked symbols from this browser. Portfolio positions are not affected.`}
        confirmLabel="Clear watchlist"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          reset();
          setConfirmClear(false);
          toastInfo('Watchlist cleared', 'All tracked symbols were removed.');
        }}
      />
    </div>
  );
}
