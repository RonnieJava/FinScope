import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/router';
import { applyThemeToDocument, useSettingsStore } from '@/store/settings';
import { ToastViewport } from '@/components/feedback/Toast';

export default function App() {
  const theme = useSettingsStore((state) => state.theme);
  const marketColors = useSettingsStore((state) => state.marketColors);

  useEffect(() => {
    applyThemeToDocument(theme, marketColors);
  }, [theme, marketColors]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastViewport />
    </BrowserRouter>
  );
}
