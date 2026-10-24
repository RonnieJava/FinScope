import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { MiniSparkline } from '@/components/ui/MiniSparkline';
import { useFormatters } from '@/hooks/useFormatters';
import { formatPercent } from '@/utils/format';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changePercent?: number;
  spark?: number[];
  footnote?: ReactNode;
  to?: string;
  className?: string;
  emphasis?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  changePercent = 0,
  spark,
  footnote,
  to,
  className,
  emphasis = false,
}: StatCardProps) {
  const tone = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
  const toneClass = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-muted';
  const Arrow = changePercent >= 0 ? ArrowUpRight : ArrowDownRight;
  const formatters = useFormatters();

  const content = (
    <div
      className={clsx(
        'fs-panel group relative flex h-full min-w-0 flex-col justify-between overflow-hidden p-4 transition-colors',
        to && 'hover:border-border-strong hover:bg-panel-2/60',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="fs-label">{label}</p>
          <p
            className={clsx(
              'fs-num mt-2 truncate font-semibold tracking-tight text-fg',
              emphasis ? 'text-[28px] leading-none' : 'text-[22px] leading-none',
            )}
          >
            {value}
          </p>
        </div>
        {tone !== 'flat' ? (
          <span
            className={clsx(
              'mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-2xs font-semibold',
              tone === 'up' ? 'bg-up-soft text-up' : 'bg-down-soft text-down',
            )}
          >
            <Arrow size={11} strokeWidth={2.4} />
            {formatPercent(changePercent, 2, false)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {typeof change === 'number' ? (
            <p className={clsx('fs-num text-xs font-medium', toneClass)}>
              {formatters.signed(change, 2)}
              <span className="ml-1 text-2xs font-normal text-muted">today</span>
            </p>
          ) : null}
          {footnote ? <p className="truncate text-2xs text-muted">{footnote}</p> : null}
        </div>
        {spark && spark.length > 1 ? (
          <MiniSparkline
            values={spark}
            tone={tone}
            width={96}
            height={30}
            className="shrink-0 opacity-90"
          />
        ) : null}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block min-w-0 focus-visible:outline-offset-4" aria-label={`Open ${label} details`}>
        {content}
      </Link>
    );
  }

  return content;
}
