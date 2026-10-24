import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { AssetTable } from '@/components/market/AssetTable';
import type { AssetSort, AssetSortKey } from '@/components/market/AssetTable';
import { useAssetsWithQuotes } from '@/hooks/useAssetsWithQuotes';
import { usePreferences } from '@/store/settings';
import { formatPercent } from '@/utils/format';
import type { AssetClass } from '@/types';

type ClassFilter = AssetClass | 'all';
type MoverFilter = 'all' | 'gainers' | 'losers';

const CLASS_TABS: Array<{ value: ClassFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'index', label: 'Indices' },
  { value: 'crypto', label: 'Crypto' },
];

const PAGE_SIZE = 12;

export default function MarketsPage() {
  const preferences = usePreferences();
  const allRows = useAssetsWithQuotes();

  const [query, setQuery] = useState('');
  const [assetClass, setAssetClass] = useState<ClassFilter>(preferences.defaultAssetClass);
  const [mover, setMover] = useState<MoverFilter>('all');
  const [sort, setSort] = useState<AssetSort>({ key: 'changePercent', direction: 'desc' });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let rows = allRows.filter((row) => {
      if (assetClass !== 'all' && row.asset.class !== assetClass) return false;
      if (!term) return true;
      return (
        row.asset.symbol.toLowerCase().includes(term) ||
        row.asset.name.toLowerCase().includes(term) ||
        row.asset.sector.toLowerCase().includes(term)
      );
    });

    if (mover === 'gainers') rows = rows.filter((row) => row.quote.changePercent > 0);
    if (mover === 'losers') rows = rows.filter((row) => row.quote.changePercent < 0);

    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
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
  }, [allRows, assetClass, mover, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const gainers = filtered.filter((row) => row.quote.changePercent > 0).length;
  const losers = filtered.filter((row) => row.quote.changePercent < 0).length;

  const handleSort = (key: AssetSortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'symbol' || key === 'name' ? 'asc' : 'desc' },
    );
    setPage(1);
  };

  const resetFilters = () => {
    setQuery('');
    setAssetClass('all');
    setMover('all');
    setSort({ key: 'changePercent', direction: 'desc' });
    setPage(1);
  };

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-fg">Markets</h1>
          <p className="mt-0.5 text-xs text-muted">
            {filtered.length} of {allRows.length} demo instruments ·{' '}
            <span className="text-up">{gainers} up</span> / <span className="text-down">{losers} down</span>
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              className="fs-input pl-8"
              placeholder="Search symbol, name or sector"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              aria-label="Search assets"
            />
          </div>
          <button type="button" className="fs-btn h-9 shrink-0" onClick={resetFilters}>
            <X size={13} /> Reset
          </button>
        </div>
      </header>

      <Panel flush>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Asset class filter">
            {CLASS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={clsx('fs-tab', assetClass === tab.value && 'fs-tab-active')}
                aria-pressed={assetClass === tab.value}
                onClick={() => {
                  setAssetClass(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Mover filter">
            <span className="mr-1 inline-flex items-center gap-1 text-2xs uppercase tracking-[0.1em] text-subtle">
              <Filter size={11} /> Movers
            </span>
            <button
              type="button"
              className={clsx('fs-tab', mover === 'all' && 'fs-tab-active')}
              aria-pressed={mover === 'all'}
              onClick={() => {
                setMover('all');
                setPage(1);
              }}
            >
              All
            </button>
            <button
              type="button"
              className={clsx('fs-tab gap-1', mover === 'gainers' && 'fs-tab-active text-up')}
              aria-pressed={mover === 'gainers'}
              onClick={() => {
                setMover('gainers');
                setPage(1);
              }}
            >
              <TrendingUp size={12} /> Gainers
            </button>
            <button
              type="button"
              className={clsx('fs-tab gap-1', mover === 'losers' && 'fs-tab-active text-down')}
              aria-pressed={mover === 'losers'}
              onClick={() => {
                setMover('losers');
                setPage(1);
              }}
            >
              <TrendingDown size={12} /> Losers
            </button>
          </div>
        </div>

        <AssetTable
          rows={pageRows}
          sort={sort}
          onSort={handleSort}
          emptyTitle="No instruments match these filters"
          emptyDescription="Clear the search or pick another asset class."
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
          <p className="fs-num text-2xs text-muted">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="fs-btn h-7 px-2 text-2xs"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span className="fs-num px-2 text-2xs text-muted">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className="fs-btn h-7 px-2 text-2xs"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              aria-label="Next page"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </Panel>

      <p className="text-2xs text-subtle">
        Market breadth for this demo: {formatPercent(
          filtered.reduce((sum, row) => sum + row.quote.changePercent, 0) / Math.max(1, filtered.length),
          2,
        )}{' '}
        average change across the current filter.
      </p>
    </div>
  );
}
