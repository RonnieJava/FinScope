import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, X } from 'lucide-react';
import clsx from 'clsx';
import { NAV_ITEMS } from '@/components/layout/Sidebar';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65] lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="animate-slide-up absolute inset-y-0 left-0 flex w-[min(280px,86vw)] flex-col border-r border-border bg-panel shadow-pop">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-white">
              <TrendingUp size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">FinScope</p>
              <p className="text-2xs uppercase tracking-[0.16em] text-subtle">Market Terminal</p>
            </div>
          </div>
          <button type="button" className="fs-icon-btn" aria-label="Close navigation" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Mobile primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex h-11 items-center gap-3 rounded px-3 text-sm transition-colors',
                    isActive ? 'bg-accent-soft text-fg' : 'text-muted hover:bg-panel-2 hover:text-fg',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={clsx('shrink-0', isActive && 'text-accent')} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <DemoDataBadge variant="banner" />
        </div>
      </div>
    </div>
  );
}
