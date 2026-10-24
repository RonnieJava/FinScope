import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  flush = false,
}: PanelProps) {
  return (
    <section className={clsx('fs-panel flex min-w-0 flex-col', className)}>
      {(title || actions) && (
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <div className="min-w-0">
            {title ? (
              <h2 className="truncate text-sm font-semibold tracking-tight text-fg">{title}</h2>
            ) : null}
            {subtitle ? <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex min-w-0 shrink items-center gap-1.5">{actions}</div> : null}
        </header>
      )}
      <div className={clsx('min-w-0 flex-1', !flush && 'p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
