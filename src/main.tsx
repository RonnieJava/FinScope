import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import './styles/globals.css';

function bootstrapTheme(): void {
  const root = document.documentElement;
  try {
    const raw = localStorage.getItem('finscope.settings.v1');
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { theme?: string; marketColors?: string } };
      const theme = parsed.state?.theme;
      const marketColors = parsed.state?.marketColors;
      if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
      if (marketColors === 'red-up' || marketColors === 'green-up') {
        root.setAttribute('data-market-colors', marketColors);
      }
    }
  } catch {
    /* corrupted storage — fall back to the markup defaults */
  }
}

bootstrapTheme();

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
