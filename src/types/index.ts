export type AssetClass = 'stock' | 'etf' | 'index' | 'crypto';

export type Exchange = 'NASDAQ' | 'NYSE' | 'ARCA' | 'CRYPTO';

export interface Asset {
  symbol: string;
  name: string;
  class: AssetClass;
  exchange: Exchange;
  sector: string;
  currency: 'USD';
  description: string;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  updatedAt: string;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface HistoricalPrice {
  time: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: 'Markets' | 'Earnings' | 'Economy' | 'Crypto' | 'Policy' | 'Technology';
  source: string;
  publishedAt: string;
  symbols: string[];
  isDemo: true;
  readTimeMin: number;
}

export type EconomicEventCategory = 'Economy' | 'Earnings' | 'Central Bank' | 'Crypto' | 'Holiday';

export interface EconomicEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: EconomicEventCategory;
  importance: 'high' | 'medium' | 'low';
  description: string;
  previous?: string;
  forecast?: string;
  isDemo: true;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  weight: number;
}

export interface PortfolioTransaction {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  date: string;
  note?: string;
}

export interface PortfolioSnapshot {
  date: string;
  value: number;
}

export interface Portfolio {
  cash: number;
  startingCash: number;
  transactions: PortfolioTransaction[];
  holdings: Holding[];
  marketValue: number;
  totalValue: number;
  dayPnl: number;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  history: PortfolioSnapshot[];
}

export type ThemeMode = 'dark' | 'light';
export type MarketColorScheme = 'red-up' | 'green-up';
export type NumberFormatPreference = 'compact' | 'standard';
export type BaseCurrency = 'USD' | 'CNY' | 'EUR';

export interface UserSettings {
  theme: ThemeMode;
  marketColors: MarketColorScheme;
  defaultAssetClass: AssetClass | 'all';
  defaultTimeRange: TimeRange;
  numberFormat: NumberFormatPreference;
  baseCurrency: BaseCurrency;
  sidebarCollapsed: boolean;
}

export interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  format: 'percent' | 'ratio' | 'currency';
  help: string;
}

export interface CorrelationCell {
  a: string;
  b: string;
  value: number;
}
