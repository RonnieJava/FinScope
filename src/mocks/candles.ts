import type { Candle, TimeRange } from '@/types';
import { getMockHistoricalPrices } from '@/mocks/historicalPrices';

const cache = new Map<string, Candle[]>();

/** Candles are derived from the same historical series used by the line chart. */
export function getMockCandles(symbol: string, range: TimeRange): Candle[] {
  const key = `${symbol.toUpperCase()}:${range}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const candles = getMockHistoricalPrices(symbol, range).map((point) => ({
    time: point.time,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume,
  }));
  cache.set(key, candles);
  return candles;
}
