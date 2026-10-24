import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { EmptyState } from '@/components/feedback/EmptyState';
import { usePortfolioStore } from '@/store/portfolio';
import { getCloseSeries, getHistoricalPrices, getPortfolio } from '@/services/data';
import { useChartTheme } from '@/hooks/useChartTheme';
import {
  annualizedVolatility,
  concentrationIndex,
  correlationMatrix,
  cumulativeReturn,
  dailyReturns,
  maxDrawdown,
  normalizedSeries,
  returnContributions,
  sharpeRatio,
} from '@/utils/analytics';
import { formatPercent } from '@/utils/format';
import type { TimeRange } from '@/types';

type Window = Extract<TimeRange, '3M' | '6M' | '1Y'>;

const WINDOWS: Array<{ value: Window; label: string; points: number }> = [
  { value: '3M', label: '3M', points: 66 },
  { value: '6M', label: '6M', points: 132 },
  { value: '1Y', label: '1Y', points: 252 },
];

const BENCHMARKS = [
  { symbol: 'SPX', label: 'S&P 500' },
  { symbol: 'NDX', label: 'NASDAQ 100' },
  { symbol: 'DJI', label: 'Dow Jones' },
];

const MIN_POINTS = 20;

function lastN<T>(values: T[], n: number): T[] {
  return values.length <= n ? values : values.slice(values.length - n);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function AnalyticsPage() {
  const transactions = usePortfolioStore((state) => state.transactions);
  const chartTheme = useChartTheme();

  const [windowKey, setWindowKey] = useState<Window>('1Y');
  const [benchmark, setBenchmark] = useState('SPX');

  const portfolio = useMemo(() => getPortfolio(transactions), [transactions]);
  const config = WINDOWS.find((entry) => entry.value === windowKey) ?? WINDOWS[2];

  const history = useMemo(() => lastN(portfolio.history, config.points), [portfolio.history, config.points]);
  const labels = history.map((point) => point.date);
  const values = history.map((point) => point.value);

  const benchmarkSeries = useMemo(() => {
    const series = getHistoricalPrices(benchmark, '1Y');
    return lastN(series, config.points);
  }, [benchmark, config.points]);
  const benchmarkValues = benchmarkSeries.map((point) => point.close);

  const returns = useMemo(() => dailyReturns(values), [values]);
  const cumReturn = cumulativeReturn(values);
  const volatility = annualizedVolatility(returns);
  const drawdown = useMemo(() => maxDrawdown(values), [values]);
  const sharpe = sharpeRatio(returns);
  const benchmarkReturn = cumulativeReturn(benchmarkValues);
  const enoughData = values.length >= MIN_POINTS;

  const correlation = useMemo(() => {
    const symbols = portfolio.holdings.map((holding) => holding.symbol);
    if (symbols.length === 0) return { symbols: [] as string[], matrix: [] as number[][] };
    const seriesMap: Record<string, number[]> = {};
    for (const symbol of symbols) {
      seriesMap[symbol] = lastN(getCloseSeries(symbol, '1Y'), config.points);
    }
    return correlationMatrix(seriesMap);
  }, [portfolio.holdings, config.points]);

  const weights = portfolio.holdings.map((holding) => holding.weight);
  const hhi = concentrationIndex(weights);
  const topWeight = weights.length === 0 ? 0 : Math.max(...weights);

  const contributions = useMemo(() => {
    const weightMap: Record<string, number> = {};
    const returnMap: Record<string, number> = {};
    for (const holding of portfolio.holdings) {
      weightMap[holding.symbol] = holding.weight;
      const series = getCloseSeries(holding.symbol, '1Y');
      returnMap[holding.symbol] = cumulativeReturn(lastN(series, config.points));
    }
    return returnContributions(weightMap, returnMap).sort(
      (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution),
    );
  }, [portfolio.holdings, config.points]);

  const growthSeries = useMemo(() => {
    const portfolioGrowth = normalizedSeries(values);
    const benchmarkGrowth = normalizedSeries(benchmarkValues);
    return { portfolioGrowth, benchmarkGrowth };
  }, [values, benchmarkValues]);

  const benchmarkLabel =
    BENCHMARKS.find((entry) => entry.symbol === benchmark)?.label ?? benchmark;

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-fg">Risk &amp; Performance</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 text-xs text-muted">
            Every metric is derived from the local demo equity curve and demo close series — nothing is
            hardcoded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1" role="group" aria-label="Analysis window">
            {WINDOWS.map((entry) => (
              <button
                key={entry.value}
                type="button"
                className={clsx('fs-tab', windowKey === entry.value && 'fs-tab-active')}
                aria-pressed={windowKey === entry.value}
                onClick={() => setWindowKey(entry.value)}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Benchmark">
            {BENCHMARKS.map((entry) => (
              <button
                key={entry.symbol}
                type="button"
                className={clsx('fs-tab', benchmark === entry.symbol && 'fs-tab-active')}
                aria-pressed={benchmark === entry.symbol}
                onClick={() => setBenchmark(entry.symbol)}
              >
                {entry.symbol}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!enoughData ? (
        <Panel>
          <EmptyState
            icon={<AlertTriangle size={18} />}
            title="Not enough history for reliable metrics"
            description={`This demo window contains ${values.length} data points; at least ${MIN_POINTS} are required before volatility, drawdown and Sharpe can be reported. Add earlier transactions to the portfolio, or widen the window.`}
            action={
              <Link to="/portfolio" className="fs-btn fs-btn-primary h-9">
                Open portfolio
              </Link>
            }
          />
        </Panel>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Portfolio metrics">
            <Metric label="Cumulative return" value={formatPercent(cumReturn, 2)} tone={cumReturn} />
            <Metric
              label="Avg daily return"
              value={formatPercent(mean(returns) * 100, 3)}
              tone={mean(returns)}
              hint={`${returns.length} sessions`}
            />
            <Metric label="Annualized volatility" value={`${volatility.toFixed(2)}%`} />
            <Metric
              label="Max drawdown"
              value={`${drawdown.maxDrawdown.toFixed(2)}%`}
              tone={drawdown.maxDrawdown}
              hint={
                drawdown.peakIndex >= 0 && history[drawdown.troughIndex]
                  ? `trough ${history[drawdown.troughIndex].date.slice(5)}`
                  : undefined
              }
            />
            <Metric label="Sharpe ratio" value={sharpe.toFixed(2)} tone={sharpe} hint="rf 2.00% / yr" />
            <Metric
              label={`${benchmark} return`}
              value={formatPercent(benchmarkReturn, 2)}
              tone={benchmarkReturn}
              hint={`alpha ${formatPercent(cumReturn - benchmarkReturn, 2)}`}
            />
          </section>

          <section className="grid gap-3 xl:grid-cols-2">
            <Panel
              title="Growth of 100"
              subtitle={`Portfolio vs ${benchmarkLabel} · ${windowKey}`}
              bodyClassName="p-3 pt-2"
            >
              <PerformanceChart
                labels={labels}
                series={[
                  {
                    name: 'Portfolio',
                    values: growthSeries.portfolioGrowth,
                    color: chartTheme.accent,
                    area: true,
                  },
                  {
                    name: benchmark,
                    values: growthSeries.benchmarkGrowth,
                    color: chartTheme.muted,
                    dashed: true,
                  },
                ]}
                height={260}
                valueSuffix=""
                ariaLabel="Portfolio growth compared with benchmark"
              />
            </Panel>

            <Panel
              title="Drawdown"
              subtitle={`Peak-to-trough decline · worst ${drawdown.maxDrawdown.toFixed(2)}%`}
              bodyClassName="p-3 pt-2"
            >
              <PerformanceChart
                labels={labels}
                series={[{ name: 'Drawdown', values: drawdown.series, color: chartTheme.down, area: true }]}
                height={260}
                valueSuffix="%"
                ariaLabel="Portfolio drawdown over time"
              />
            </Panel>
          </section>

          <section className="grid gap-3 xl:grid-cols-3">
            <Panel
              className="xl:col-span-2"
              title="Correlation matrix"
              subtitle={`Daily-return correlation across ${correlation.symbols.length} holdings · ${windowKey}`}
            >
              {correlation.symbols.length === 0 ? (
                <EmptyState title="No holdings to correlate" description="Add positions in the portfolio page." />
              ) : (
                <div className="fs-scroll-x">
                  <table className="w-full min-w-[420px] border-collapse">
                    <thead>
                      <tr>
                        <th className="fs-th text-left"> </th>
                        {correlation.symbols.map((symbol) => (
                          <th key={symbol} className="fs-th text-center">
                            {symbol}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {correlation.symbols.map((symbol, rowIndex) => (
                        <tr key={symbol}>
                          <th className="fs-td text-left text-xs font-medium text-muted">{symbol}</th>
                          {correlation.matrix[rowIndex].map((value, columnIndex) => (
                            <td key={`${symbol}-${correlation.symbols[columnIndex]}`} className="p-0.5">
                              <span
                                className={clsx(
                                  'fs-num flex h-9 items-center justify-center rounded text-2xs font-medium',
                                  Math.abs(value) > 0.55 ? 'text-fg' : 'text-muted',
                                )}
                                style={{
                                  backgroundColor:
                                    value >= 0
                                      ? `rgba(79, 140, 255, ${Math.min(0.55, value * 0.55)})`
                                      : `rgba(245, 185, 66, ${Math.min(0.55, Math.abs(value) * 0.55)})`,
                                }}
                                title={`${symbol} vs ${correlation.symbols[columnIndex]}: ${value.toFixed(2)}`}
                              >
                                {value.toFixed(2)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-2xs text-subtle">
                Pearson correlation of daily returns. Values above 0.7 indicate highly overlapping risk; negative
                values indicate diversification.
              </p>
            </Panel>

            <Panel title="Concentration" subtitle="Herfindahl-Hirschman index of held weights">
              <div className="space-y-3">
                <div>
                  <p className="fs-label">HHI (0–10,000)</p>
                  <p className="fs-num mt-1 text-2xl font-semibold leading-none text-fg">{hhi.toFixed(0)}</p>
                  <p className="mt-1 text-2xs text-muted">
                    {hhi > 2500 ? 'Highly concentrated' : hhi > 1500 ? 'Moderately concentrated' : 'Diversified'}
                  </p>
                </div>
                <div>
                  <p className="fs-label">Largest position</p>
                  <p className="fs-num mt-1 text-lg font-semibold leading-none text-fg">
                    {topWeight.toFixed(1)}%
                  </p>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-3" aria-hidden>
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.min(100, topWeight)}%` }}
                  />
                </div>
                <p className="text-2xs leading-relaxed text-subtle">
                  HHI sums the squared portfolio weights. Below 1,500 is considered diversified, above 2,500
                  concentrated. Cash is excluded from this calculation.
                </p>
              </div>
            </Panel>
          </section>

          <Panel
            title="Return contribution"
            subtitle={`Weight × ${windowKey} return per holding`}
            flush
          >
            {contributions.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No positions" description="Return contributions appear once you hold assets." />
              </div>
            ) : (
              <div className="fs-scroll-x">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-panel-2/40">
                      <th className="fs-th text-left">Symbol</th>
                      <th className="fs-th text-right">Weight</th>
                      <th className="fs-th text-right">{windowKey} return</th>
                      <th className="fs-th text-right">Contribution</th>
                      <th className="fs-th text-left">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((row) => {
                      const maxAbs = Math.max(...contributions.map((entry) => Math.abs(entry.contribution)), 1);
                      const width = (Math.abs(row.contribution) / maxAbs) * 100;
                      return (
                        <tr key={row.symbol} className="fs-row">
                          <td className="fs-td">
                            <Link to={`/assets/${row.symbol}`} className="text-xs font-semibold text-fg hover:text-accent">
                              {row.symbol}
                            </Link>
                          </td>
                          <td className="fs-td fs-num text-right">{row.weight.toFixed(1)}%</td>
                          <td
                            className={clsx(
                              'fs-td fs-num text-right',
                              row.returnPercent > 0 ? 'text-up' : row.returnPercent < 0 ? 'text-down' : 'text-muted',
                            )}
                          >
                            {formatPercent(row.returnPercent, 2)}
                          </td>
                          <td
                            className={clsx(
                              'fs-td fs-num text-right',
                              row.contribution > 0 ? 'text-up' : row.contribution < 0 ? 'text-down' : 'text-muted',
                            )}
                          >
                            {formatPercent(row.contribution, 2)}
                          </td>
                          <td className="fs-td">
                            <span className="block h-1.5 w-32 overflow-hidden rounded-full bg-panel-3" aria-hidden>
                              <span
                                className={clsx(
                                  'block h-full rounded-full',
                                  row.contribution >= 0 ? 'bg-up' : 'bg-down',
                                )}
                                style={{ width: `${width}%` }}
                              />
                            </span>
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
            title="Methodology"
            subtitle="How these demo numbers are calculated"
            actions={<Info size={14} className="text-subtle" aria-hidden />}
          >
            <ul className="grid gap-2 text-2xs leading-relaxed text-muted sm:grid-cols-2">
              <li>
                <span className="text-fg">Cumulative return</span> — last equity value divided by the first value
                in the selected window, minus one.
              </li>
              <li>
                <span className="text-fg">Daily return</span> — simple close-to-close change of the demo equity
                curve; the average is the arithmetic mean of those sessions.
              </li>
              <li>
                <span className="text-fg">Annualized volatility</span> — sample standard deviation of daily
                returns × √252.
              </li>
              <li>
                <span className="text-fg">Max drawdown</span> — largest peak-to-trough decline of the equity
                curve inside the window.
              </li>
              <li>
                <span className="text-fg">Sharpe ratio</span> — mean excess daily return over a 2.00% annual risk-free
                rate, divided by its standard deviation, annualized by √252.
              </li>
              <li>
                <span className="text-fg">Correlation</span> — Pearson correlation of daily returns between each
                pair of holdings over the same window.
              </li>
              <li>
                <span className="text-fg">Concentration (HHI)</span> — sum of squared position weights, scaled
                0–10,000.
              </li>
              <li>
                <span className="text-fg">Contribution</span> — position weight × its window return, in percentage
                points of portfolio return.
              </li>
            </ul>
            <p className="mt-3 flex items-start gap-1.5 border-t border-border pt-3 text-2xs text-subtle">
              <ShieldCheck size={12} className="mt-0.5 shrink-0" />
              <span>
                Demo series are synthetic and generated deterministically. Results illustrate the calculation
                methodology only and are not investment advice or historical performance of any real portfolio.
              </span>
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: number;
  hint?: string;
}) {
  return (
    <div className="fs-panel min-w-0 px-4 py-3">
      <p className="fs-label truncate">{label}</p>
      <p
        className={clsx(
          'fs-num mt-1.5 truncate text-[19px] font-semibold leading-none',
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
      {hint ? <p className="fs-num mt-1.5 truncate text-2xs text-muted">{hint}</p> : null}
    </div>
  );
}
