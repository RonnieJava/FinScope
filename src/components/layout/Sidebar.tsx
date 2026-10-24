import { NavLink } from 'react-router-dom';
import {
  Activity,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  LineChart,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  Star,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { useSettingsStore } from '@/store/settings';
import { getMarketOverview } from '@/services/data';
import { Tooltip } from '@/components/ui/Tooltip';

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/markets', label: 'Markets', icon: LineChart },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar() {
  const collapsed = useSettingsStore((state) => state.sidebarCollapsed);
  const setCollapsed = useSettingsStore((state) => state.setSidebarCollapsed);
  const overview = getMarketOverview();

  return (
    <aside
      className={clsx(
        'hidden shrink-0 flex-col border-r border-border bg-panel transition-[width] duration-200 lg:flex',
      )}
      style={{ width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}
    >
      <div
        className={clsx(
          'flex h-14 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'gap-3 px-4',
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent text-white">
          <TrendingUp size={17} />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-fg">FinScope</p>
            <p className="truncate text-2xs uppercase tracking-[0.16em] text-subtle">Market Terminal</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'group flex h-9 items-center gap-2.5 rounded px-2.5 text-sm transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-accent-soft text-fg'
                    : 'text-muted hover:bg-panel-2 hover:text-fg',
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={clsx('shrink-0', isActive && 'text-accent')} />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </>
              )}
            </NavLink>
          );
          return collapsed ? (
            <Tooltip key={item.to} label={item.label} side="bottom">
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border p-2">
        {!collapsed ? (
          <div className="rounded border border-border bg-panel-2 px-2.5 py-2">
            <p className="fs-label">Breadth</p>
            <div className="mt-1 flex items-center justify-between text-2xs">
              <span className="text-up">{overview.advances} adv</span>
              <span className="text-muted">/</span>
              <span className="text-down">{overview.declines} dec</span>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="flex h-8 w-full items-center justify-center gap-2 rounded text-xs text-muted transition-colors hover:bg-panel-2 hover:text-fg"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
