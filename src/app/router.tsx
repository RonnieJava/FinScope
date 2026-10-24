import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import MarketsPage from '@/pages/MarketsPage';
import AssetDetailPage from '@/pages/AssetDetailPage';
import WatchlistPage from '@/pages/WatchlistPage';
import PortfolioPage from '@/pages/PortfolioPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import NewsPage from '@/pages/NewsPage';
import CalendarPage from '@/pages/CalendarPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/assets/:symbol" element={<AssetDetailPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
