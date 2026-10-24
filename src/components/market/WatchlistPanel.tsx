import { Link } from 'react-router-dom';
import { ArrowRight, Star, X } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useFormatters } from '@/hooks/useFormatters';
import { useWatchlistStore } from '@/store/watchlist';
import { getAssetsWithQuotes } from '@/services/data';
import { assetDecimals } from '@/utils/format';

interface WatchlistPanelProps {
  limit?: number;
  className?: string;
}

export function WatchlistPanel({ limit, className }: WatchlistPanelProps) {
  const symbols = useWatchlistStore((state) => state.symbols);
  const remove = useWatchlistStore((state) => state.remove);
  const formatters = useFormatters();
  const rows = getAssetsWithQuotes(symbols);
  const visible = typeof limit === 'number' ? rows.slice(0, limit) : rows;

  return (
    <Panel
      title="Watchlist"
      subtitle={`${rows.length} tracked ${rows.length === 1 ? 'asset' : 'assets'}`}
      className={className}
      flush
      actions={
        <Link to="/watchlist" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs">
          Manage
        </Link>
      }
    >
      {visible.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={<Star size={18} />}
            title="No assets in your watchlist"
            description="Star any asset from Markets or its detail page to track it here."
            action={
              <Link to="/markets" className="fs-btn fs-btn-primary h-8">
                Browse markets
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {visible.map(({ asset, quote }) => {
            const tone = quote.changePercent > 0 ? 'text-up' : quote.changePercent < 0 ? 'text-down' : 'text-muted';
            return (
              <li key={asset.symbol} className="group flex items-center gap-2 px-3 py-2 hover:bg-panel-2/70">
                <Link to={`/assets/${asset.symbol}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg group-hover:text-accent">{asset.symbol}</p>
                  <p className="truncate text-2xs text-muted">{asset.name}</p>
                </Link>
                <div className="shrink-0 text-right">
                  <p className={clsx('fs-num text-sm font-medium', tone)}>
                    {formatters.price(quote.price, assetDecimals(asset.class, quote.price))}
                  </p>
                  <p className={clsx('fs-num text-2xs font-medium', tone)}>
                    {formatters.percent(quote.changePercent, 2)}
                  </p>
                </div>
                <button
                  type="button"
                  className="fs-icon-btn h-7 w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Remove ${asset.symbol} from watchlist`}
                  onClick={() => remove(asset.symbol)}
                >
                  <X size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {rows.length > visible.length ? (
        <div className="border-t border-border px-3 py-2">
          <Link to="/watchlist" className="inline-flex items-center gap-1 text-2xs font-medium text-accent hover:underline">
            View all {rows.length} assets <ArrowRight size={11} />
          </Link>
        </div>
      ) : null}
    </Panel>
  );
}
