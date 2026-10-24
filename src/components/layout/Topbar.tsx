import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleDot, Menu, RefreshCw, Settings as SettingsIcon, Briefcase, Star } from 'lucide-react';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MarketColorToggle } from '@/components/ui/MarketColorToggle';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSettingsStore } from '@/store/settings';
import { usePortfolioStore } from '@/store/portfolio';
import { DEMO_DATE_LABEL, DEMO_UPDATED_AT } from '@/utils/date';
import { formatTime } from '@/utils/format';
import { toastInfo } from '@/store/toast';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export function Topbar({ onOpenMobileNav }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const resetPortfolio = usePortfolioStore((state) => state.reset);
  const resetSettings = useSettingsStore((state) => state.reset);
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-panel px-3 sm:px-4">
      <button
        type="button"
        className="fs-icon-btn lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <span className="flex items-center gap-1.5 rounded-full border border-[color:var(--up)]/30 bg-up-soft px-2 py-0.5 text-2xs font-medium text-up">
          <CircleDot size={10} /> MARKET OPEN
        </span>
        <span className="truncate text-2xs text-subtle">{DEMO_DATE_LABEL}</span>
      </div>

      <div className="flex min-w-0 flex-1 justify-center px-1">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="mr-1 hidden text-right xl:block">
          <p className="text-2xs uppercase tracking-[0.12em] text-subtle">Demo snapshot</p>
          <p className="fs-num text-2xs text-muted">{formatTime(DEMO_UPDATED_AT)} ET</p>
        </div>
        <ThemeToggle />
        <MarketColorToggle />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open user preferences menu"
            className="fs-touch-target ml-1 flex h-9 items-center gap-1.5 rounded border border-border bg-panel-2 pl-1 pr-1.5 transition-colors hover:border-border-strong"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
              DI
            </span>
            <ChevronDown size={13} className="text-muted" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-lg border border-border bg-panel-2 shadow-pop"
            >
              <div className="border-b border-border px-3 py-2.5">
                <p className="text-xs font-medium text-fg">Demo Investor</p>
                <p className="text-2xs text-subtle">Local session · no account</p>
              </div>
              <div className="py-1">
                <Link
                  to="/portfolio"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted transition-colors hover:bg-panel-3 hover:text-fg"
                >
                  <Briefcase size={13} /> Portfolio
                </Link>
                <Link
                  to="/watchlist"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted transition-colors hover:bg-panel-3 hover:text-fg"
                >
                  <Star size={13} /> Watchlist
                </Link>
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted transition-colors hover:bg-panel-3 hover:text-fg"
                >
                  <SettingsIcon size={13} /> Preferences
                </Link>
              </div>
              <div className="border-t border-border py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    resetPortfolio();
                    resetSettings();
                    setMenuOpen(false);
                    navigate('/');
                    toastInfo('Demo data reset', 'Portfolio and preferences were restored to defaults.');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted transition-colors hover:bg-panel-3 hover:text-fg"
                >
                  <RefreshCw size={13} /> Reset demo data
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
