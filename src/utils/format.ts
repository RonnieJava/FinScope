import type { BaseCurrency, NumberFormatPreference } from '@/types';

const FX_FROM_USD: Record<BaseCurrency, number> = {
  USD: 1,
  CNY: 7.12,
  EUR: 0.92,
};

export const CURRENCY_SYMBOL: Record<BaseCurrency, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
};

export const CURRENCY_LABEL: Record<BaseCurrency, string> = {
  USD: 'US Dollar',
  CNY: 'Chinese Yuan',
  EUR: 'Euro',
};

export function convertFromUsd(value: number, currency: BaseCurrency): number {
  return value * FX_FROM_USD[currency];
}

export function fxRate(currency: BaseCurrency): number {
  return FX_FROM_USD[currency];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatPrice(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals = 2, withSign = true): string {
  if (!Number.isFinite(value)) return '—';
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatSignedNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPrice(value, decimals)}`;
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}

export function formatBigNumber(value: number, pref: NumberFormatPreference = 'compact'): string {
  if (!Number.isFinite(value)) return '—';
  if (pref === 'standard') {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return formatCompactNumber(value);
}

export function formatCurrency(value: number, currency: BaseCurrency = 'USD'): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: Math.abs(value) >= 10_000 ? 0 : 2,
  }).format(value);
}

export function formatMoneyFromUsd(value: number, currency: BaseCurrency = 'USD'): string {
  return formatCurrency(convertFromUsd(value, currency), currency);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  });
}

export function timeAgo(iso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function assetDecimals(assetClass: string, price: number): number {
  if (assetClass === 'crypto') return price < 1 ? 4 : 2;
  if (assetClass === 'index') return 2;
  return 2;
}

export function pnlTone(value: number): 'up' | 'down' | 'flat' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}
