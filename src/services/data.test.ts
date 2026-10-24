import { describe, expect, it } from 'vitest';
import {
  getAssetBySymbol,
  getAssets,
  getAssetsWithQuotes,
  getCalendarEvents,
  getCandles,
  getCloseSeries,
  getHistoricalPrices,
  getMarketOverview,
  getNews,
  getPortfolio,
  getQuote,
  getTopMovers,
  searchAssets,
} from '@/services/data';
import { RANGE_POINTS } from '@/mocks/historicalPrices';

describe('asset catalogue', () => {
  it('contains a non-empty, uniquely keyed universe', () => {
    const assets = getAssets();
    expect(assets.length).toBeGreaterThan(0);
    const symbols = assets.map((asset) => asset.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it('looks assets up case-insensitively and returns undefined for unknown symbols', () => {
    expect(getAssetBySymbol('AAPL')?.symbol).toBe('AAPL');
    expect(getAssetBySymbol('aapl')?.symbol).toBe('AAPL');
    expect(getAssetBySymbol('NOPE')).toBeUndefined();
  });

  it('returns a quote for every asset in the catalogue', () => {
    const rows = getAssetsWithQuotes();
    expect(rows.length).toBe(getAssets().length);
    rows.forEach(({ quote }) => {
      expect(quote.price).toBeGreaterThan(0);
      expect(Number.isFinite(quote.marketCap)).toBe(true);
    });
  });

  it('filters a symbol list', () => {
    const rows = getAssetsWithQuotes(['AAPL', 'NOPE', 'MSFT']);
    expect(rows.map((row) => row.asset.symbol)).toEqual(['AAPL', 'MSFT']);
  });
});

describe('searchAssets', () => {
  it('matches tickers and names case-insensitively', () => {
    const byTicker = searchAssets('aapl');
    expect(byTicker.some((asset) => asset.symbol === 'AAPL')).toBe(true);

    const byName = searchAssets('apple');
    expect(byName.some((asset) => asset.symbol === 'AAPL')).toBe(true);
  });

  it('restricts results to the requested asset class', () => {
    const crypto = searchAssets('', 'crypto');
    expect(crypto.length).toBeGreaterThan(0);
    expect(crypto.every((asset) => asset.class === 'crypto')).toBe(true);
  });

  it('returns an empty list when nothing matches', () => {
    expect(searchAssets('zzzz-not-a-ticker')).toEqual([]);
  });

  it('returns the whole class pool for an empty query', () => {
    expect(searchAssets('   ').length).toBe(getAssets().length);
  });
});

describe('historical series', () => {
  it('produces a stable series with the documented point count', () => {
    const first = getHistoricalPrices('AAPL', '1M');
    const second = getHistoricalPrices('AAPL', '1M');
    expect(first.length).toBe(RANGE_POINTS['1M']);
    expect(second).toEqual(first);
  });

  it('returns [] for an unknown symbol', () => {
    expect(getHistoricalPrices('NOPE', '1M')).toEqual([]);
    expect(getCloseSeries('NOPE', '1M')).toEqual([]);
    expect(getCandles('NOPE', '1M')).toEqual([]);
  });

  it('keeps OHLC values internally consistent', () => {
    getHistoricalPrices('NVDA', '3M').forEach((point) => {
      expect(point.high).toBeGreaterThanOrEqual(Math.max(point.open, point.close));
      expect(point.low).toBeLessThanOrEqual(Math.min(point.open, point.close));
      expect(point.volume).toBeGreaterThanOrEqual(0);
    });
  });

  it('exposes close series that match the price series', () => {
    const prices = getHistoricalPrices('MSFT', '1W');
    expect(getCloseSeries('MSFT', '1W')).toEqual(prices.map((point) => point.close));
  });

  it('builds candles from the same cached draw', () => {
    const first = getCandles('BTC-USD', '1M');
    expect(first).toEqual(getCandles('BTC-USD', '1M'));
    expect(first.length).toBe(RANGE_POINTS['1M']);
  });
});

describe('news and calendar demo data', () => {
  it('sorts news newest first and keeps it stable between calls', () => {
    const news = getNews();
    expect(news.length).toBeGreaterThan(0);
    expect(getNews()).toEqual(news);

    const timestamps = news.map((item) => new Date(item.publishedAt).getTime());
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });

  it('marks every news item as demo content', () => {
    getNews().forEach((item) => {
      expect(item.isDemo).toBe(true);
      expect(item.source).toMatch(/demo/i);
    });
  });

  it('sorts calendar events chronologically and keeps them stable', () => {
    const events = getCalendarEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(getCalendarEvents()).toEqual(events);

    const keys = events.map((event) => `${event.date}${event.time}`);
    expect(keys).toEqual([...keys].sort());
    events.forEach((event) => expect(event.isDemo).toBe(true));
  });
});

describe('market overview', () => {
  it('summarises every equity in the advance/decline buckets', () => {
    const overview = getMarketOverview();
    const equities = getAssetsWithQuotes().filter(
      (row) => row.asset.class === 'stock' || row.asset.class === 'etf',
    );
    expect(overview.advances + overview.declines + overview.unchanged).toBe(equities.length);
    expect(overview.indices.length).toBeGreaterThan(1);
    expect(Number.isFinite(overview.averageChange)).toBe(true);
  });

  it('ranks gainers above losers', () => {
    const { gainers, losers } = getTopMovers(5);
    expect(gainers[0].quote.changePercent).toBeGreaterThanOrEqual(
      gainers[gainers.length - 1].quote.changePercent,
    );
    expect(losers[0].quote.changePercent).toBeLessThanOrEqual(
      losers[losers.length - 1].quote.changePercent,
    );
  });
});

describe('demo portfolio', () => {
  it('keeps cash plus market value equal to total value', () => {
    const portfolio = getPortfolio();
    expect(portfolio.cash + portfolio.marketValue).toBeCloseTo(portfolio.totalValue, 6);
    expect(portfolio.totalValue).toBeGreaterThan(0);
    expect(portfolio.history.length).toBeGreaterThan(1);
  });

  it('reports the quote snapshot used by the UI', () => {
    expect(getQuote('AAPL')?.price).toBeGreaterThan(0);
    expect(getQuote('NOPE')).toBeUndefined();
  });
});
