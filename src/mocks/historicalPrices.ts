import type { HistoricalPrice, TimeRange } from '@/types';
import { ASSET_SEEDS, type AssetSeed } from '@/mocks/universe';
import { QUOTES } from '@/mocks/quotes';
import { createRng, gaussian } from '@/utils/random';
import { DEMO_NOW, businessDaysBack, intradayTimestamps, toISODate } from '@/utils/date';

export const RANGE_POINTS: Record<TimeRange, number> = {
  '1D': 78,
  '1W': 5,
  '1M': 22,
  '3M': 66,
  '6M': 132,
  '1Y': 252,
};

const seedBySymbol = new Map(ASSET_SEEDS.map((seed) => [seed.symbol, seed]));

function decimalsFor(seed: AssetSeed, price: number): number {
  if (seed.class === 'crypto' && price < 1) return 4;
  return 2;
}

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

/** Brownian bridge from `start` to `end` so the final point always matches the live quote. */
function buildPath(
  rng: () => number,
  points: number,
  start: number,
  end: number,
  stepVolatility: number,
): number[] {
  const raw: number[] = [0];
  for (let i = 1; i < points; i++) {
    raw.push(raw[i - 1] + gaussian(rng) * stepVolatility);
  }
  const rawEnd = raw[points - 1];
  return raw.map((value, i) => {
    const t = points === 1 ? 1 : i / (points - 1);
    const detrended = value - rawEnd * t;
    const base = start + (end - start) * t;
    return Math.max(0.0001, base + detrended * start * 0.55);
  });
}

function buildSeries(seed: AssetSeed, range: TimeRange): HistoricalPrice[] {
  const quote = QUOTES[seed.symbol];
  const points = RANGE_POINTS[range];
  const rng = createRng(`${seed.symbol}:${range}:history:v4`);
  const isIntraday = range === '1D';

  let start: number;
  if (isIntraday) {
    start = quote?.open ?? seed.basePrice;
  } else {
    const years = points / 252;
    const totalReturn = seed.drift * years + gaussian(rng) * seed.volatility * Math.sqrt(years);
    const safeReturn = Math.max(totalReturn, -0.85);
    start = seed.basePrice / (1 + safeReturn);
  }
  const end = quote?.price ?? seed.basePrice;

  const stepVolatility = isIntraday
    ? seed.volatility / Math.sqrt(points)
    : seed.volatility / Math.sqrt(points) * 1.35;
  const closes = buildPath(rng, points, start, end, stepVolatility);
  const decimals = decimalsFor(seed, end);

  const timestamps = isIntraday
    ? intradayTimestamps(points, DEMO_NOW)
    : businessDaysBack(DEMO_NOW, points).map((d) => new Date(`${toISODate(d)}T20:00:00.000Z`));

  const dailyVolume = seed.baseVolume * (0.8 + rng() * 0.4);

  return closes.map((close, i) => {
    const previous = i === 0 ? closes[0] : closes[i - 1];
    const open = i === 0 ? (isIntraday ? closes[0] * (1 + (gaussian(rng) * seed.volatility) / 3) : previous) : previous;
    const wick = Math.abs(gaussian(rng)) * seed.volatility * close * 0.35;
    const high = Math.max(open, close) + wick;
    const low = Math.max(0.0001, Math.min(open, close) - wick * 0.8);
    const sessionFactor = isIntraday
      ? (0.55 + Math.abs(i / (points - 1) - 0.5) * 1.35) / points
      : 0.62 + rng() * 0.82;
    const volume = seed.baseVolume === 0 ? 0 : Math.round(dailyVolume * sessionFactor * (0.7 + rng() * 0.6));

    return {
      time: timestamps[i].toISOString(),
      close: round(close, decimals),
      open: round(open, decimals),
      high: round(Math.max(high, close, open), decimals),
      low: round(Math.min(low, close, open), decimals),
      volume,
    };
  });
}

const cache = new Map<string, HistoricalPrice[]>();

export function getMockHistoricalPrices(symbol: string, range: TimeRange): HistoricalPrice[] {
  const key = `${symbol.toUpperCase()}:${range}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const seed = seedBySymbol.get(symbol.toUpperCase());
  if (!seed) return [];
  const series = buildSeries(seed, range);
  cache.set(key, series);
  return series;
}

export function getMockCloseSeries(symbol: string, range: TimeRange): number[] {
  return getMockHistoricalPrices(symbol, range).map((p) => p.close);
}

export { seedBySymbol };
