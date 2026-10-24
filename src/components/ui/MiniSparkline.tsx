import { useId } from 'react';
import clsx from 'clsx';

interface MiniSparklineProps {
  values: number[];
  tone?: 'up' | 'down' | 'flat';
  width?: number;
  height?: number;
  className?: string;
  filled?: boolean;
}

function buildPath(values: number[], width: number, height: number, pad: number): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = values.length === 1 ? 0 : (width - pad * 2) / (values.length - 1);
  return values
    .map((value, index) => {
      const x = pad + index * stepX;
      const y = pad + (1 - (value - min) / span) * (height - pad * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function MiniSparkline({
  values,
  tone = 'flat',
  width = 104,
  height = 32,
  className,
  filled = true,
}: MiniSparklineProps) {
  const gradientId = useId().replace(/:/g, '');
  const color = tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--muted)';
  const path = buildPath(values, width, height, 2);
  const areaPath =
    values.length > 1 && path
      ? `${path} L${width - 2},${height - 1} L2,${height - 1} Z`
      : '';

  if (values.length < 2) {
    return <div className={clsx('h-8 w-[104px]', className)} aria-hidden="true" />;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={clsx('block overflow-visible', className)}
      role="img"
      aria-label={`Trend sparkline, ${tone === 'flat' ? 'unchanged' : `${tone} trend`}`}
    >
      <defs>
        <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && areaPath ? <path d={areaPath} fill={`url(#spark-${gradientId})`} /> : null}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
