import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import { MiniSparkline } from '@/components/ui/MiniSparkline';
import { useFormatters } from '@/hooks/useFormatters';
import { useWatchlistStore } from '@/store/watchlist';
import { assetDecimals } from '@/utils/format';
import type { AssetWithQuote } from '@/services/data';

const CLASS_LABEL: Record<string, string> = {
  stock: 'Stock',
  etf: 'ETF',
  index: 'Index',
  crypto: 'Crypto',
};

interface AssetRowProps {
  row: AssetWithQuote;
  spark?: number[];
  showClass?: boolean;
  actions?: ReactNode;
}

export function AssetRow({ row, spark, showClass = false, actions }: AssetRowProps) {
  const formatters = useFormatters();
  const symbols = useWatchlistStore((state) => state.symbols);
  const toggle = useWatchlistStore((state) => state.toggle);
  const { asset, quote } = row;
  const watched = symbols.includes(asset.symbol);
  const tone = quote.changePercent > 0 ? 'up' : quote.changePercent < 0 ? 'down' : 'flat';
  const toneClass = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-muted';
  const decimals = assetDecimals(asset.class, quote.price);

  return (
    <tr className="fs-row group relative">
      <td className="w-9 pl-2 pr-0">
        <button
          type="button"
          onClick={() => toggle(asset.symbol)}
          aria-pressed={watched}
          aria-label={watched ? `Remove ${asset.symbol} from watchlist` : `Add ${asset.symbol} to watchlist`}
          className={clsx(
            'fs-touch-target relative z-10 inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
            watched ? 'text-warn' : 'text-subtle hover:text-fg',
          )}
        >
          <Star size={13} fill={watched ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </button>
      </td>

      <td className="fs-td max-w-[220px] py-2">
        <Link
          to={`/assets/${asset.symbol}`}
          className="fs-touch-target-row block min-w-0 after:absolute after:inset-0 after:content-['']"
        >
          <span className="block truncate text-sm font-semibold text-fg group-hover:text-accent">
            {asset.symbol}
          </span>
          <span className="block truncate text-2xs text-muted">{asset.name}</span>
        </Link>
      </td>

      {showClass ? (
        <td className="fs-td">
          <span className="text-2xs uppercase tracking-[0.1em] text-subtle">{CLASS_LABEL[asset.class]}</span>
        </td>
      ) : null}

      <td className="fs-td text-right">
        <span className={clsx('fs-num font-medium', toneClass)}>{formatters.price(quote.price, decimals)}</span>
      </td>

      <td className="fs-td text-right">
        <span className={clsx('fs-num text-xs font-semibold', toneClass)}>
          {formatters.percent(quote.changePercent, 2)}
        </span>
      </td>

      <td className="fs-td text-right text-xs text-muted">
        <span className="fs-num">{quote.volume > 0 ? formatters.compact(quote.volume) : '—'}</span>
      </td>

      <td className="hidden w-[110px] py-2 pr-3 sm:table-cell">
        <div className="flex justify-end">
          {spark && spark.length > 1 ? (
            <MiniSparkline values={spark} tone={tone} width={88} height={26} filled={false} />
          ) : (
            <span className="text-2xs text-subtle">—</span>
          )}
        </div>
      </td>

      {actions ? <td className="relative z-10 py-2 pr-2 text-right">{actions}</td> : null}
    </tr>
  );
}
