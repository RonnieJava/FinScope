import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface DemoDataBadgeProps {
  variant?: 'inline' | 'banner';
  className?: string;
  message?: string;
}

export function DemoDataBadge({
  variant = 'inline',
  className,
  message = 'DEMO DATA — NOT LIVE MARKET DATA',
}: DemoDataBadgeProps) {
  if (variant === 'banner') {
    return (
      <div
        className={clsx(
          'flex items-center justify-center gap-2 border-b border-warn/25 bg-warn/10 px-4 py-1.5 text-2xs font-medium uppercase tracking-[0.18em] text-warn',
          className,
        )}
        role="note"
      >
        <AlertTriangle size={12} strokeWidth={2.2} />
        <span className="truncate">{message}</span>
      </div>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-warn',
        className,
      )}
      title={message}
    >
      Demo
    </span>
  );
}
