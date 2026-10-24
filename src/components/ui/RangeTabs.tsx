import clsx from 'clsx';
import type { TimeRange } from '@/types';

export const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];

interface RangeTabsProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
  label?: string;
}

export function RangeTabs({ value, onChange, className, label = 'Chart time range' }: RangeTabsProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx('flex items-center gap-0.5 rounded border border-border bg-panel-2 p-0.5', className)}
    >
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          aria-pressed={value === range}
          className={clsx(
            'h-6 min-w-[34px] rounded-sm px-1.5 text-2xs font-semibold transition-colors',
            value === range ? 'bg-panel-3 text-fg' : 'text-muted hover:text-fg',
          )}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
