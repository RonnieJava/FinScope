import { AlertTriangle, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The demo dataset could not be loaded.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={clsx('flex flex-col items-center gap-3 px-6 py-10 text-center', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle size={18} />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="max-w-sm text-xs text-muted">{description}</p>
      </div>
      {onRetry ? (
        <button type="button" className="fs-btn" onClick={onRetry}>
          <RotateCcw size={13} /> Retry
        </button>
      ) : null}
    </div>
  );
}
