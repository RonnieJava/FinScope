import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock3, Gauge, TrendingDown, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { RangeTabs } from '@/components/ui/RangeTabs';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { MarketOverviewChart } from '@/components/charts/MarketOverviewChart';
import { AssetTable } from '@/components/market/AssetTable';
import { WatchlistPanel } from '@/components/market/WatchlistPanel';
import { NewsCard } from '@/components/news/NewsCard';
import {
  getAssetsByClass,
  getAssetsWithQuotes,
  getCloseSeries,
  getHistoricalPrices,
  getMarketOverview,
  getNews,
  getTopMovers,
} from '@/services/data';
import { usePreferences } from '@/store/settings';
import { useRecentStore } from '@/store/recent';
import { useFormatters } from '@/hooks/useFormatters';
import { DEMO_DATE_LABEL, DEMO_TIME_LABEL } from '@/utils/date';
import { formatPercent } from '@/utils/format';
import type { TimeRange } from '@/types';

const DEFAULT_CHART_SYMBOL = 'SPX';

export default function DashboardPage() {
  const navigate = useNavigate();
  const preferences = usePreferences();
  const recentSymbols = useRecentStore((state) => state.symbols);
  const formatters = useFormatters();

  const [range, setRange] = useState<TimeRange>(preferences.defaultTimeRange);
  const [chartSymbol, setChartSymbol] = useState(DEFAULT_CHART_SYMBOL);

  const overview = useMemo(() => getMarketOverview(), []);
  const movers = useMemo(() => getTopMovers(5), []);
  const etfs = useMemo(() => getAssetsByClass('etf', 5), []);
  const crypto = useMemo(() => getAssetsByClass('crypto', 5), []);
  const news = useMemo(() => getNews().slice(0, 4), []);

  const series = useMemo(() => getHistoricalPrices(chartSymbol, range), [chartSymbol, range]);
  const sparks = useMemo(
    () => new Map(overview.indices.map((row) => [row.asset.symbol, getCloseSeries(row.asset.symbol, '1D')])),
    [overview],
  );

  const recentRows = useMemo(() => getAssetsWithQuotes(recentSymbols), [recentSymbols]);

  const rangeReturn =
    series.length > 1 && series[0].close !== 0
      ? ((series[series.length - 1].close - series[0].close) / series[0].close) * 100
      : 0;
  const rangeTone = rangeReturn > 0 ? 'text-up' : rangeReturn < 0 ? 'text-down' : 'text-muted';

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-fg">Market Overview</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>{DEMO_DATE_LABEL}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={11} /> Updated {DEMO_TIME_LABEL}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Demo session open
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded border border-border bg-panel-2 px-2.5 py-1.5 text-2xs text-muted sm:flex">
            <span className="text-up">{overview.advances} advancing</span>
            <span className="text-subtle">/</span>
            <span className="text-down">{overview.declines} declining</span>
            <span className="text-subtle">/</span>
            <span>{overview.unchanged} flat</span>
          </div>
          <Link to="/markets" className="fs-btn h-8">
            All markets <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Index summary">
        {overview.indices.map(({ asset, quote }, index) => {
          const decimals = asset.class === 'index' && quote.price > 1000 ? 2 : 2;
          return (
            <StatCard
              key={asset.symbol}
              label={`${asset.symbol} · ${asset.name}`}
              value={formatters.price(quote.price, decimals)}
              change={quote.change}
              changePercent={quote.changePercent}
              spark={sparks.get(asset.symbol)}
              footnote={index === 3 ? 'Volatility index (VIX)' : `Vol ${formatters.compact(quote.volume)}`}
              to={`/assets/${asset.symbol}`}
              emphasis={index === 0}
            />
          );
        })}
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Market trend"
          subtitle={
            <span className="inline-flex flex-wrap items-center gap-x-2">
              <span>{chartSymbol} · {range} close</span>
              <span className={clsx('fs-num font-medium', rangeTone)}>{formatPercent(rangeReturn, 2)}</span>
              <span className="text-subtle">over selected range</span>
            </span>
          }
          actions={<RangeTabs value={range} onChange={setRange} />}
          bodyClassName="p-3 pt-2"
        >
          <div className="mb-2 flex flex-wrap items-center gap-1">
            {overview.indices.map(({ asset, quote }) => (
              <button
                key={asset.symbol}
                type="button"
                onClick={() => setChartSymbol(asset.symbol)}
                aria-pressed={chartSymbol === asset.symbol}
                className={clsx(
                  'inline-flex h-7 items-center gap-1.5 rounded border px-2 text-2xs font-semibold transition-colors',
                  chartSymbol === asset.symbol
                    ? 'border-accent/50 bg-accent-soft text-fg'
                    : 'border-border bg-panel-2 text-muted hover:text-fg',
                )}
              >
                {asset.symbol}
                <span
                  className={clsx(
                    'fs-num',
                    quote.changePercent > 0 ? 'text-up' : quote.changePercent < 0 ? 'text-down' : 'text-muted',
                  )}
                >
                  {formatPercent(quote.changePercent, 2)}
                </span>
              </button>
            ))}
          </div>

          <MarketOverviewChart
            key={`${chartSymbol}-${range}`}
            series={series}
            symbol={chartSymbol}
            range={range}
            height={320}
          />

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
            <BreadthStat
              label="Advancing"
              value={String(overview.advances)}
              tone="up"
              icon={<TrendingUp size={12} />}
            />
            <BreadthStat
              label="Declining"
              value={String(overview.declines)}
              tone="down"
              icon={<TrendingDown size={12} />}
            />
            <BreadthStat label="Avg. change" value={formatPercent(overview.averageChange, 2)} />
            <BreadthStat
              label="Session"
              value="Demo open"
              icon={<Gauge size={12} />}
            />
          </div>
        </Panel>

        <WatchlistPanel limit={7} />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MoverPanel
          title="Top gainers"
          tone="up"
          rows={movers.gainers}
          onSeeAll={() => navigate('/markets')}
        />
        <MoverPanel
          title="Top losers"
          tone="down"
          rows={movers.losers}
          onSeeAll={() => navigate('/markets')}
        />
        <Panel title="ETF flows" flush actions={<Link to="/markets" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs">All</Link>}>
          <AssetTable rows={etfs} showClass={false} showSparkline={false} />
        </Panel>
        <Panel title="Crypto" flush actions={<Link to="/markets" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs">All</Link>}>
          <AssetTable rows={crypto} showClass={false} showSparkline={false} />
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Market news"
          subtitle="Fictional demo headlines — not real reporting"
          flush
          actions={<Link to="/news" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs">Newsroom</Link>}
        >
          <ul className="divide-y divide-border/70">
            {news.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <NewsCard item={item} onOpen={() => navigate('/news')} compact />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recently viewed"
          subtitle="Persisted in this browser"
          flush
          actions={
            recentRows.length > 0 ? (
              <Link to="/markets" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs">
                Browse
              </Link>
            ) : null
          }
        >
          {recentRows.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted">
              Open any asset to build your recent list.
            </p>
          ) : (
            <ul className="divide-y divide-border/70">
              {recentRows.map(({ asset, quote }) => {
                const tone =
                  quote.changePercent > 0 ? 'text-up' : quote.changePercent < 0 ? 'text-down' : 'text-muted';
                return (
                  <li key={asset.symbol}>
                    <Link
                      to={`/assets/${asset.symbol}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-panel-2/70"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-fg">{asset.symbol}</span>
                        <span className="block truncate text-2xs text-muted">{asset.name}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={clsx('fs-num block text-sm', tone)}>
                          {formatters.price(quote.price, 2)}
                        </span>
                        <span className={clsx('fs-num block text-2xs', tone)}>
                          {formatPercent(quote.changePercent, 2)}
                        </span>
                      </span>
                      <ArrowUpRight size={13} className="shrink-0 text-subtle" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function BreadthStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down';
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="fs-label flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p
        className={clsx(
          'fs-num mt-1 truncate text-sm font-semibold',
          tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-fg',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MoverPanel({
  title,
  tone,
  rows,
  onSeeAll,
}: {
  title: string;
  tone: 'up' | 'down';
  rows: ReturnType<typeof getTopMovers>['gainers'];
  onSeeAll: () => void;
}) {
  const Icon = tone === 'up' ? TrendingUp : TrendingDown;
  const formatters = useFormatters();

  return (
    <Panel
      title={
        <span className="inline-flex items-center gap-1.5">
          <Icon size={13} className={tone === 'up' ? 'text-up' : 'text-down'} />
          {title}
        </span>
      }
      flush
      actions={
        <button type="button" className="fs-btn fs-btn-ghost h-7 px-2 text-2xs" onClick={onSeeAll}>
          Markets
        </button>
      }
    >
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-muted">No movers in this demo session.</p>
      ) : (
        <ul className="divide-y divide-border/70">
          {rows.map(({ asset, quote }) => {
            const rowTone =
              quote.changePercent > 0 ? 'text-up' : quote.changePercent < 0 ? 'text-down' : 'text-muted';
            return (
              <li key={asset.symbol}>
                <Link
                  to={`/assets/${asset.symbol}`}
                  className="flex items-center justify-between gap-2 px-4 py-2 transition-colors hover:bg-panel-2/70"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{asset.symbol}</span>
                    <span className="block truncate text-2xs text-muted">{asset.name}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="fs-num block text-sm text-fg">{formatters.price(quote.price, 2)}</span>
                    <span className={clsx('fs-num block text-2xs font-semibold', rowTone)}>
                      {formatPercent(quote.changePercent, 2)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
