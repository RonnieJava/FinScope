import type { ReactNode } from 'react';
import clsx from 'clsx';

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/** Lightweight CSS tooltip — no portal, no JS positioning, keyboard-accessible content stays visible. */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={clsx('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute left-1/2 z-40 w-max max-w-[240px] -translate-x-1/2 rounded border border-border bg-panel-3 px-2 py-1 text-2xs leading-snug text-fg opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
          side === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]',
        )}
      >
        {label}
      </span>
    </span>
  );
}
