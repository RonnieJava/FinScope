import type {
  Asset,
  Candle,
  EconomicEvent,
  HistoricalPrice,
  NewsItem,
  Portfolio,
  PortfolioTransaction,
  Quote,
  TimeRange,
} from '@/types';
import { ASSETS, getAsset, getRelatedAssets, searchAssets } from '@/mocks/assets';
import { INDEX_OVERVIEW_SYMBOLS, DEFAULT_WATCHLIST } from '@/mocks/universe';
import { QUOTES, getMockQuote, getMockQuotes } from '@/mocks/quotes';
import { getMockHistoricalPrices, getMockCloseSeries } from '@/mocks/historicalPrices';
import { getMockCandles } from '@/mocks/candles';
import { getMockNews } from '@/mocks/news';
import { getMockCalendarEvents } from '@/mocks/calendar';
import { DEMO_TRANSACTIONS, STARTING_CASH } from '@/mocks/portfolio';
import { buildLedger, computePortfolio, sortTransactions } from '@/utils/portfolio';
import { toISODate } from '@/utils/date';

export interface AssetWithQuote {
  asset: Asset;
  quote: Quote;
}

export function getQuoteMap(): Record<string, Quote> {
  return QUOTES;
}

export function getAssets(): Asset[] {
  return ASSETS;
}

export function getAssetBySymbol(symbol: string): Asset | undefined {
  return getAsset(symbol);
}

export function getQuote(symbol: string): Quote | undefined {
  return getMockQuote(symbol);
}

export function getAssetsWithQuotes(symbols?: string[]): AssetWithQuote[] {
  const pool = symbols
    ? symbols.map((symbol) => getAsset(symbol)).filter((a): a is Asset => Boolean(a))
    : ASSETS;
  return pool
    .map((asset) => ({ asset, quote: QUOTES[asset.symbol] }))
    .filter((row): row is AssetWithQuote => Boolean(row.quote));
}

export function getWatchlist(): AssetWithQuote[] {
  return getAssetsWithQuotes(DEFAULT_WATCHLIST);
}

export interface MarketOverview {
  indices: AssetWithQuote[];
  advances: number;
  declines: number;
  unchanged: number;
  averageChange: number;
}

export function getMarketOverview(): MarketOverview {
  const equities = getAssetsWithQuotes().filter(
    (row) => row.asset.class === 'stock' || row.asset.class === 'etf',
  );
  const advances = equities.filter((row) => row.quote.changePercent > 0).length;
  const declines = equities.filter((row) => row.quote.changePercent < 0).length;
  const unchanged = equities.length - advances - declines;
  const averageChange =
    equities.reduce((sum, row) => sum + row.quote.changePercent, 0) / Math.max(1, equities.length);

  return {
    indices: getAssetsWithQuotes(INDEX_OVERVIEW_SYMBOLS),
    advances,
    declines,
    unchanged,
    averageChange,
  };
}

export function getHistoricalPrices(symbol: string, range: TimeRange): HistoricalPrice[] {
  return getMockHistoricalPrices(symbol, range);
}

export function getCandles(symbol: string, range: TimeRange): Candle[] {
  return getMockCandles(symbol, range);
}

export function getCloseSeries(symbol: string, range: TimeRange): number[] {
  return getMockCloseSeries(symbol, range);
}

export function getNews(): NewsItem[] {
  return [...getMockNews()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getCalendarEvents(): EconomicEvent[] {
  return [...getMockCalendarEvents()].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );
}

export function getTopMovers(limit = 5): { gainers: AssetWithQuote[]; losers: AssetWithQuote[] } {
  const equities = getAssetsWithQuotes().filter((row) => row.asset.class !== 'index');
  const sorted = [...equities].sort((a, b) => b.quote.changePercent - a.quote.changePercent);
  return {
    gainers: sorted.slice(0, limit),
    losers: [...sorted].reverse().slice(0, limit),
  };
}

export function getAssetsByClass(assetClass: Asset['class'], limit?: number): AssetWithQuote[] {
  const rows = getAssetsWithQuotes().filter((row) => row.asset.class === assetClass);
  return limit ? rows.slice(0, limit) : rows;
}

export { getRelatedAssets, searchAssets, getMockQuotes, sortTransactions };

/**
 * Equity curve for the demo portfolio. Replays the ledger on each trading day using
 * the historical close series of every symbol that appears in the transaction log.
 */
export function buildPortfolioHistory(
  transactions: PortfolioTransaction[],
  startingCash: number,
): Array<{ date: string; value: number }> {
  const calendar = getMockHistoricalPrices('SPX', '1Y');
  if (calendar.length === 0) return [];

  const symbols = [...new Set(transactions.map((tx) => tx.symbol))];
  const closeBySymbol = new Map<string, Map<string, number>>();
  for (const symbol of symbols) {
    const series = getMockHistoricalPrices(symbol, '1Y');
    const map = new Map<string, number>();
    for (const point of series) {
      map.set(point.time.slice(0, 10), point.close);
    }
    closeBySymbol.set(symbol, map);
  }

  return calendar.map((point) => {
    const day = point.time.slice(0, 10);
    const endOfDay = `${day}T23:59:59.999Z`;
    const upToToday = transactions.filter((tx) => tx.date <= endOfDay);
    const ledger = buildLedger(upToToday, startingCash);
    const marketValue = ledger.positions.reduce((sum, position) => {
      const map = closeBySymbol.get(position.symbol);
      if (!map) return sum + position.quantity * position.averageCost;
      const close = map.get(day) ?? position.averageCost;
      return sum + position.quantity * close;
    }, 0);
    return { date: day, value: Number((ledger.cash + marketValue).toFixed(2)) };
  });
}

export function getPortfolio(transactions: PortfolioTransaction[] = DEMO_TRANSACTIONS): Portfolio {
  const history = buildPortfolioHistory(transactions, STARTING_CASH);
  return computePortfolio(transactions, STARTING_CASH, QUOTES, history);
}

export function getDemoPortfolioSeed(): { transactions: PortfolioTransaction[]; startingCash: number } {
  return { transactions: DEMO_TRANSACTIONS, startingCash: STARTING_CASH };
}

export function getTodayLabel(): string {
  return toISODate(new Date('2026-10-23T19:42:00Z'));
}
