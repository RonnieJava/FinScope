import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  LineChart as LineChartIcon,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { RangeTabs } from '@/components/ui/RangeTabs';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { MarketOverviewChart } from '@/components/charts/MarketOverviewChart';
import { CandlestickChart } from '@/components/charts/CandlestickChart';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { AssetTable } from '@/components/market/AssetTable';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAssetsWithQuotes } from '@/hooks/useAssetsWithQuotes';
import { useFormatters } from '@/hooks/useFormatters';
import {
  getAssetBySymbol,
  getCandles,
  getHistoricalPrices,
  getQuote,
  getRelatedAssets,
} from '@/services/data';
import { ema, macd, rsi, sma } from '@/utils/indicators';
import { assetDecimals } from '@/utils/format';
import { DEMO_TIME_LABEL, DEMO_UPDATED_AT } from '@/utils/date';
import { useRecentStore } from '@/store/recent';
import { useSettingsStore } from '@/store/settings';
import { useWatchlistStore } from '@/store/watchlist';
import { toastInfo, toastSuccess } from '@/store/toast';
import type { Candle, TimeRange } from '@/types';

type ChartMode = 'line' | 'candle';

const CLASS_LABEL: Record<string, string> = {
  stock: 'Stock',
  etf: 'ETF',
  index: 'Index',
  crypto: 'Crypto',
};

function lastValid(values: Array<number | null>): number | null {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    if (values[i] !== null) return values[i] as number;
  }
  return null;
}

export default function AssetDetailPage() {
  const { symbol = '' } = useParams();
  const ticker = symbol.toUpperCase();
  const formatters = useFormatters();
  const defaultTimeRange = useSettingsStore((state) => state.defaultTimeRange);

  const asset = getAssetBySymbol(ticker);
  const quote = getQuote(ticker);

  const [range, setRange] = useState<TimeRange>(defaultTimeRange);
  const [mode, setMode] = useState<ChartMode>('line');
  const [hovered, setHovered] = useState<Candle | null>(null);

  const visit = useRecentStore((state) => state.visit);
  const watched = useWatchlistStore((state) => state.symbols.includes(ticker));
  const toggleWatch = useWatchlistStore((state) => state.toggle);

  useEffect(() => {
    if (asset) visit(asset.symbol);
  }, [asset, visit]);

  const series = useMemo(() => (asset ? getHistoricalPrices(ticker, range) : []), [asset, ticker, range]);
  const candles = useMemo(() => (asset ? getCandles(ticker, range) : []), [asset, ticker, range]);
  const closes = useMemo(() => series.map((point) => point.close), [series]);

  const relatedSymbols = useMemo(
    () => (asset ? getRelatedAssets(ticker, 6).map((item) => item.symbol) : []),
    [asset, ticker],
  );
  const relatedRows = useAssetsWithQuotes(relatedSymbols);

  const indicators = useMemo(() => {
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const rsi14 = rsi(closes, 14);
    const macdResult = macd(closes);
    return {
      sma20: lastValid(sma20),
      sma50: lastValid(sma50),
      ema12: lastValid(ema12),
      ema26: lastValid(ema26),
      rsi14: lastValid(rsi14),
      macd: lastValid(macdResult.macd),
      signal: lastValid(macdResult.signal),
      histogram: lastValid(macdResult.histogram),
      rsiSeries: rsi14,
      macdSeries: macdResult,
    };
  }, [closes]);

  const rsiChart = useMemo(() => {
    const start = indicators.rsiSeries.findIndex((value) => value !== null);
    if (start < 0) return null;
    return {
      labels: series.slice(start).map((point) => point.time),
      values: indicators.rsiSeries.slice(start) as number[],
    };
  }, [indicators.rsiSeries, series]);

  const macdChart = useMemo(() => {
    const start = indicators.macdSeries.signal.findIndex((value) => value !== null);
    if (start < 0) return null;
    return {
      labels: series.slice(start).map((point) => point.time),
      macd: indicators.macdSeries.macd.slice(start) as number[],
      signal: indicators.macdSeries.signal.slice(start) as number[],
    };
  }, [indicators.macdSeries, series]);

  if (!asset || !quote) {
    return (
      <div className="mx-auto max-w-2xl py-6">
        <Panel title="Asset not found">
          <ErrorState
            title={`No demo asset matches “${ticker || 'unknown'}”`}
            description="FinScope only contains a fixed demo universe. Try searching for a symbol from the Markets page."
          />
          <div className="flex justify-center gap-2 pb-2">
            <Link className="fs-btn fs-btn-primary" to="/markets">
              Browse markets
            </Link>
            <Link className="fs-btn" to="/">
              Back to dashboard
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  const decimals = assetDecimals(asset.class, quote.price);
  const tone = quote.changePercent > 0 ? 'up' : quote.changePercent < 0 ? 'down' : 'flat';
  const toneClass = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-muted';
  const TrendIcon = quote.changePercent >= 0 ? TrendingUp : TrendingDown;
  const rangeReturn =
    series.length > 1 && series[0].close !== 0
      ? ((series[series.length - 1].close - series[0].close) / series[0].close) * 100
      : 0;
  const shown = hovered ?? (candles.length > 0 ? candles[candles.length - 1] : null);

  const handleToggleWatch = () => {
    const added = toggleWatch(asset.symbol);
    if (added) toastSuccess(`${asset.symbol} added to watchlist`, 'Saved in this browser.');
    else toastInfo(`${asset.symbol} removed from watchlist`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link to="/markets" className="inline-flex items-center gap-1 hover:text-fg">
          <ArrowLeft size={13} /> Markets
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-fg">{asset.symbol}</span>
      </div>

      <header className="fs-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-fg">{asset.symbol}</h1>
            <span className="fs-chip cursor-default">{CLASS_LABEL[asset.class]}</span>
            <span className="text-2xs uppercase tracking-[0.14em] text-subtle">{asset.exchange}</span>
            <DemoDataBadge className="h-5 px-1.5 text-[10px]" />
          </div>
          <p className="mt-1 truncate text-sm text-muted">{asset.name}</p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-subtle">{asset.description}</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <span className="fs-num text-3xl font-semibold leading-none text-fg">
              {formatters.price(quote.price, decimals)}
            </span>
            <span className={clsx('inline-flex items-center gap-1 text-sm font-semibold', toneClass)}>
              <TrendIcon size={14} />
              <span className="fs-num">
                {formatters.signed(quote.change, decimals)} ({formatters.percent(quote.changePercent, 2)})
              </span>
            </span>
          </div>
          <p className="mt-2 text-2xs text-subtle">
            Demo quote · {DEMO_TIME_LABEL} · updated {DEMO_UPDATED_AT}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleWatch}
            aria-pressed={watched}
            className={clsx('fs-btn h-9 gap-1.5 px-3', watched && 'border-warn/40 bg-warn/10 text-warn')}
          >
            <Star size={14} fill={watched ? 'currentColor' : 'none'} />
            {watched ? 'In watchlist' : 'Add to watchlist'}
          </button>
          <Link to="/portfolio" className="fs-btn h-9 px-3">
            Trade in demo portfolio
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Open', value: formatters.price(quote.open, decimals) },
          { label: 'Day high', value: formatters.price(quote.high, decimals) },
          { label: 'Day low', value: formatters.price(quote.low, decimals) },
          { label: 'Prev close', value: formatters.price(quote.previousClose, decimals) },
          { label: 'Volume', value: quote.volume > 0 ? formatters.compact(quote.volume) : '—' },
          { label: 'Market cap', value: quote.marketCap > 0 ? formatters.big(quote.marketCap) : '—' },
        ].map((item) => (
          <div key={item.label} className="fs-panel px-3 py-2.5">
            <p className="fs-label">{item.label}</p>
            <p className="fs-num mt-1 text-sm font-medium text-fg">{item.value}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Price history"
        subtitle={`${asset.symbol} · demo series · ${range}`}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <div
              role="group"
              aria-label="Chart type"
              className="flex items-center gap-0.5 rounded border border-border bg-panel-2 p-0.5"
            >
              <button
                type="button"
                aria-pressed={mode === 'line'}
                onClick={() => setMode('line')}
                className={clsx(
                  'inline-flex h-6 items-center gap-1 rounded-sm px-2 text-2xs font-semibold transition-colors',
                  mode === 'line' ? 'bg-panel-3 text-fg' : 'text-muted hover:text-fg',
                )}
              >
                <LineChartIcon size={11} /> Line
              </button>
              <button
                type="button"
                aria-pressed={mode === 'candle'}
                onClick={() => setMode('candle')}
                className={clsx(
                  'inline-flex h-6 items-center gap-1 rounded-sm px-2 text-2xs font-semibold transition-colors',
                  mode === 'candle' ? 'bg-panel-3 text-fg' : 'text-muted hover:text-fg',
                )}
              >
                <BarChart3 size={11} /> Candles
              </button>
            </div>
            <RangeTabs value={range} onChange={setRange} />
          </div>
        }
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-2xs text-muted">
            <span>Range return</span>
            <span className={clsx('fs-num font-semibold', rangeReturn >= 0 ? 'text-up' : 'text-down')}>
              {formatters.percent(rangeReturn, 2)}
            </span>
          </div>
          {mode === 'candle' && shown ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs text-muted">
              <span>
                O <span className="text-fg">{formatters.price(shown.open, decimals)}</span>
              </span>
              <span>
                H <span className="text-fg">{formatters.price(shown.high, decimals)}</span>
              </span>
              <span>
                L <span className="text-fg">{formatters.price(shown.low, decimals)}</span>
              </span>
              <span>
                C <span className="text-fg">{formatters.price(shown.close, decimals)}</span>
              </span>
              <span>
                Vol <span className="text-fg">{formatters.compact(shown.volume)}</span>
              </span>
            </div>
          ) : null}
        </div>

        {series.length === 0 ? (
          <EmptyState
            title="No price history for this range"
            description="The demo dataset does not contain enough points for this interval."
          />
        ) : mode === 'line' ? (
          <MarketOverviewChart series={series} symbol={asset.symbol} range={range} height={320} />
        ) : (
          <CandlestickChart
            candles={candles}
            height={340}
            showVolume={false}
            onHover={(candle) => setHovered(candle)}
          />
        )}
      </Panel>

      <Panel title="Volume" subtitle="Demo traded volume per interval">
        {candles.length === 0 ? (
          <EmptyState title="No volume data" description="Try a different time range." />
        ) : (
          <VolumeChart candles={candles} range={range} height={130} />
        )}
      </Panel>

      <Panel
        title="Technical indicators"
        subtitle="Computed locally from the demo close series — not provider values"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {[
            { label: 'SMA 20', value: indicators.sma20 },
            { label: 'SMA 50', value: indicators.sma50 },
            { label: 'EMA 12', value: indicators.ema12 },
            { label: 'EMA 26', value: indicators.ema26 },
            { label: 'RSI 14', value: indicators.rsi14 },
            { label: 'MACD', value: indicators.macd },
            { label: 'Signal', value: indicators.signal },
          ].map((item) => (
            <div key={item.label} className="rounded border border-border bg-panel-2/60 px-2.5 py-2">
              <p className="fs-label">{item.label}</p>
              <p className="fs-num mt-1 text-sm font-medium text-fg">
                {item.value === null ? '—' : formatters.price(item.value, 2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="fs-label mb-1">
              RSI 14 {indicators.rsi14 === null ? '' : `· ${indicators.rsi14.toFixed(1)}`}
            </p>
            {rsiChart ? (
              <PerformanceChart
                labels={rsiChart.labels}
                series={[{ name: 'RSI 14', values: rsiChart.values, color: 'var(--accent)' }]}
                height={140}
                decimals={1}
                ariaLabel={`${asset.symbol} RSI 14 chart`}
              />
            ) : (
              <EmptyState
                title="Not enough data for RSI"
                description="RSI needs at least 15 points. Select a longer time range."
                className="py-6"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="fs-label mb-1">
              MACD 12 / 26 / 9
              {indicators.histogram === null ? '' : ` · histogram ${indicators.histogram.toFixed(2)}`}
            </p>
            {macdChart ? (
              <PerformanceChart
                labels={macdChart.labels}
                series={[
                  { name: 'MACD', values: macdChart.macd, color: 'var(--accent)' },
                  { name: 'Signal', values: macdChart.signal, color: 'var(--warn)', dashed: true },
                ]}
                height={140}
                decimals={2}
                ariaLabel={`${asset.symbol} MACD chart`}
              />
            ) : (
              <EmptyState
                title="Not enough data for MACD"
                description="MACD needs at least 35 points. Select a longer time range."
                className="py-6"
              />
            )}
          </div>
        </div>
      </Panel>

      <Panel
        title="Related assets"
        subtitle="Same demo sector or asset class"
        actions={
          <Link to="/markets" className="fs-link text-xs">
            View all
          </Link>
        }
        flush
      >
        <AssetTable rows={relatedRows} />
      </Panel>
    </div>
  );
}
