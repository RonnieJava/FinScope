import clsx from 'clsx';
import { useFormatters } from '@/hooks/useFormatters';
import type { Portfolio } from '@/types';
import { formatPercent } from '@/utils/format';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

interface Metric {
  label: string;
  value: string;
  hint?: string;
  tone?: 'up' | 'down' | 'flat';
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const formatters = useFormatters();

  const dayPercent =
    portfolio.totalValue - portfolio.dayPnl === 0
      ? 0
      : (portfolio.dayPnl / (portfolio.totalValue - portfolio.dayPnl)) * 100;
  const totalPercent =
    portfolio.startingCash === 0 ? 0 : (portfolio.totalPnl / portfolio.startingCash) * 100;

  const metrics: Metric[] = [
    { label: 'Total value', value: formatters.money(portfolio.totalValue), hint: 'cash + market value' },
    { label: 'Market value', value: formatters.money(portfolio.marketValue), hint: `${portfolio.holdings.length} positions` },
    { label: 'Cash balance', value: formatters.money(portfolio.cash), hint: 'demo settlement cash' },
    {
      label: 'Day P&L',
      value: formatters.signed(portfolio.dayPnl, 2),
      hint: formatPercent(dayPercent, 2),
      tone: portfolio.dayPnl > 0 ? 'up' : portfolio.dayPnl < 0 ? 'down' : 'flat',
    },
    {
      label: 'Total P&L',
      value: formatters.signed(portfolio.totalPnl, 2),
      hint: formatPercent(totalPercent, 2),
      tone: portfolio.totalPnl > 0 ? 'up' : portfolio.totalPnl < 0 ? 'down' : 'flat',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="fs-panel min-w-0 px-4 py-3">
          <p className="fs-label">{metric.label}</p>
          <p
            className={clsx(
              'fs-num mt-1.5 truncate text-[19px] font-semibold leading-none',
              metric.tone === 'up' ? 'text-up' : metric.tone === 'down' ? 'text-down' : 'text-fg',
            )}
          >
            {metric.value}
          </p>
          {metric.hint ? (
            <p
              className={clsx(
                'fs-num mt-1.5 truncate text-2xs',
                metric.tone === 'up' ? 'text-up' : metric.tone === 'down' ? 'text-down' : 'text-muted',
              )}
            >
              {metric.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
