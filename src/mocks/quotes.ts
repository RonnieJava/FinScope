import type { Quote } from '@/types';
import { ASSET_SEEDS, type AssetSeed } from '@/mocks/universe';
import { createRng, gaussian } from '@/utils/random';
import { DEMO_UPDATED_AT } from '@/utils/date';

function decimalsFor(seed: AssetSeed, price: number): number {
  if (seed.class === 'crypto' && price < 1) return 4;
  return 2;
}

function roundPrice(price: number, decimals: number): number {
  return Number(price.toFixed(decimals));
}

function buildQuote(seed: AssetSeed): Quote {
  const rng = createRng(`${seed.symbol}:quote:v3`);
  const g = gaussian(rng);
  const changePercent = Number(((seed.drift * 0.12 + g * seed.volatility * 0.9) * 100).toFixed(2));
  const previousClose = seed.basePrice;
  const price = previousClose * (1 + changePercent / 100);
  const decimals = decimalsFor(seed, price);
  const open = previousClose * (1 + gaussian(rng) * seed.volatility * 0.35);
  const high = Math.max(open, price) * (1 + Math.abs(gaussian(rng)) * seed.volatility * 0.45);
  const low = Math.min(open, price) * (1 - Math.abs(gaussian(rng)) * seed.volatility * 0.45);
  const volume = Math.round(seed.baseVolume * (0.72 + rng() * 0.66));
  const marketCap = seed.marketCap === 0 ? 0 : seed.marketCap * (price / seed.basePrice);

  return {
    symbol: seed.symbol,
    price: roundPrice(price, decimals),
    change: roundPrice(price - previousClose, decimals),
    changePercent,
    open: roundPrice(open, decimals),
    high: roundPrice(high, decimals),
    low: roundPrice(low, decimals),
    previousClose: roundPrice(previousClose, decimals),
    volume,
    marketCap: Math.round(marketCap),
    updatedAt: DEMO_UPDATED_AT,
  };
}

export const QUOTES: Record<string, Quote> = Object.fromEntries(
  ASSET_SEEDS.map((seed) => [seed.symbol, buildQuote(seed)]),
);

export const QUOTE_LIST: Quote[] = Object.values(QUOTES);

export function getMockQuote(symbol: string): Quote | undefined {
  return QUOTES[symbol.toUpperCase()];
}

export function getMockQuotes(symbols: string[]): Quote[] {
  return symbols.map((s) => QUOTES[s.toUpperCase()]).filter((q): q is Quote => Boolean(q));
}
