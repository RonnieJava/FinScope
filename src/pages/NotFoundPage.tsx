import { Link, useLocation } from 'react-router-dom';
import { Compass, Search } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { EmptyState } from '@/components/feedback/EmptyState';

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      <Panel className="overflow-hidden">
        <EmptyState
          icon={<Compass size={20} />}
          title="This screen is not part of the demo terminal"
          description={`No route matches "${location.pathname}". FinScope ships nine demo pages plus this fallback — check the sidebar or search for a ticker.`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to="/" className="fs-btn fs-btn-primary h-9 px-3 text-xs">
                Back to dashboard
              </Link>
              <Link to="/markets" className="fs-btn h-9 px-3 text-xs">
                <Search size={13} />
                Browse markets
              </Link>
            </div>
          }
          className="py-16"
        />
      </Panel>

      <Panel title="Available demo routes" subtitle="All data is local and synthetic">
        <ul className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3">
          {[
            ['/', 'Dashboard'],
            ['/markets', 'Markets'],
            ['/watchlist', 'Watchlist'],
            ['/portfolio', 'Portfolio'],
            ['/analytics', 'Analytics'],
            ['/news', 'News'],
            ['/calendar', 'Calendar'],
            ['/settings', 'Settings'],
            ['/assets/SPX', 'Asset detail'],
          ].map(([to, label]) => (
            <li key={to}>
              <Link
                to={to}
                className="flex min-h-[44px] flex-col justify-center rounded border border-border bg-panel-2 px-2.5 py-1.5 transition-colors hover:border-accent/40 hover:text-accent sm:min-h-0"
              >
                <span className="text-fg">{label}</span>
                <span className="fs-num text-2xs text-subtle">{to}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
