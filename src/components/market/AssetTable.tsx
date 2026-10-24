import { useMemo } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import clsx from 'clsx';
import { AssetRow } from '@/components/market/AssetRow';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getCloseSeries } from '@/services/data';
import type { AssetWithQuote } from '@/services/data';
import type { TimeRange } from '@/types';

export type AssetSortKey = 'symbol' | 'name' | 'price' | 'changePercent' | 'volume';

export interface AssetSort {
  key: AssetSortKey;
  direction: 'asc' | 'desc';
}

interface AssetTableProps {
  rows: AssetWithQuote[];
  showClass?: boolean;
  showSparkline?: boolean;
  sparkRange?: TimeRange;
  sort?: AssetSort | null;
  onSort?: (key: AssetSortKey) => void;
  actionLabel?: string;
  renderActions?: (row: AssetWithQuote) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: AssetSortKey;
  sort?: AssetSort | null;
  onSort?: (key: AssetSortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sort?.key === sortKey;
  if (!onSort) {
    return <span className={clsx('block', align === 'right' && 'text-right')}>{label}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}`}
      className={clsx(
        'inline-flex items-center gap-1 transition-colors hover:text-fg',
        align === 'right' && 'justify-end',
        active ? 'text-fg' : 'text-muted',
      )}
    >
      {label}
      {active ? (
        sort?.direction === 'asc' ? (
          <ArrowUp size={10} />
        ) : (
          <ArrowDown size={10} />
        )
      ) : null}
    </button>
  );
}

export function AssetTable({
  rows,
  showClass = true,
  showSparkline = true,
  sparkRange = '1M',
  sort,
  onSort,
  renderActions,
  emptyTitle = 'No assets match these filters',
  emptyDescription = 'Try a different search term or asset class.',
}: AssetTableProps) {
  const sparks = useMemo(() => {
    const map = new Map<string, number[]>();
    if (!showSparkline) return map;
    for (const row of rows) {
      map.set(row.asset.symbol, getCloseSeries(row.asset.symbol, sparkRange));
    }
    return map;
  }, [rows, showSparkline, sparkRange]);

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="fs-scroll-x">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-border bg-panel-2/40">
            <th className="w-9" aria-label="Watchlist" />
            <th className="fs-th text-left">
              <SortHeader label="Symbol" sortKey="symbol" sort={sort} onSort={onSort} />
            </th>
            {showClass ? (
              <th className="fs-th text-left">
                <SortHeader label="Class" sortKey="name" sort={sort} onSort={undefined} />
              </th>
            ) : null}
            <th className="fs-th text-right">
              <SortHeader label="Price" sortKey="price" sort={sort} onSort={onSort} align="right" />
            </th>
            <th className="fs-th text-right">
              <SortHeader label="Change" sortKey="changePercent" sort={sort} onSort={onSort} align="right" />
            </th>
            <th className="fs-th text-right">
              <SortHeader label="Volume" sortKey="volume" sort={sort} onSort={onSort} align="right" />
            </th>
            <th className="fs-th hidden text-right sm:table-cell">
              <SortHeader label="30D trend" sortKey="name" sort={sort} onSort={undefined} align="right" />
            </th>
            {renderActions ? <th className="fs-th w-10 text-right" aria-label="Actions" /> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <AssetRow
              key={row.asset.symbol}
              row={row}
              showClass={showClass}
              spark={sparks.get(row.asset.symbol)}
              actions={renderActions?.(row)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
