import clsx from 'clsx';

interface LoadingStateProps {
  rows?: number;
  className?: string;
  label?: string;
}

export function LoadingState({ rows = 4, className, label = 'Loading demo data' }: LoadingStateProps) {
  return (
    <div className={clsx('space-y-2 p-4', className)} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="fs-skeleton h-4 rounded"
          style={{ width: `${88 - index * 7}%`, opacity: 1 - index * 0.1 }}
        />
      ))}
    </div>
  );
}
