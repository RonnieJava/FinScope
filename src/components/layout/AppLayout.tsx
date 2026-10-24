import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-full min-h-0 w-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <DemoDataBadge variant="banner" />

        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1680px] p-3 sm:p-4">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNavigation open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
