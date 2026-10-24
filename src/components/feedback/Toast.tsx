import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { useToastStore } from '@/store/toast';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONES = {
  success: 'text-[var(--up)]',
  error: 'text-danger',
  info: 'text-accent',
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone];
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto animate-toast-in rounded-lg border border-border bg-panel-2 p-3 shadow-pop"
          >
            <div className="flex items-start gap-2.5">
              <Icon size={16} className={clsx('mt-0.5 shrink-0', TONES[toast.tone])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{toast.title}</p>
                {toast.message ? <p className="mt-0.5 text-xs text-muted">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                className="shrink-0 text-subtle transition-colors hover:text-fg"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
