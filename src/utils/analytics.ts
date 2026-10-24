import { roundTo } from '@/utils/format';

export interface SeriesPoint {
  date: string;
  value: number;
}

export function dailyReturns(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] === 0) {
      returns.push(0);
      continue;
    }
    returns.push(values[i] / values[i - 1] - 1);
  }
  return returns;
}

export function cumulativeReturn(values: number[]): number {
  if (values.length < 2 || values[0] === 0) return 0;
  return (values[values.length - 1] / values[0] - 1) * 100;
}

export function annualizedVolatility(returns: number[], periodsPerYear = 252): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(periodsPerYear) * 100;
}

export interface DrawdownResult {
  maxDrawdown: number;
  peakIndex: number;
  troughIndex: number;
  series: number[];
}

export function maxDrawdown(values: number[]): DrawdownResult {
  if (values.length === 0) return { maxDrawdown: 0, peakIndex: -1, troughIndex: -1, series: [] };
  let peak = values[0];
  let peakIndex = 0;
  let bestPeak = 0;
  let bestTrough = 0;
  let worst = 0;
  const series: number[] = [];
  values.forEach((value, index) => {
    if (value > peak) {
      peak = value;
      peakIndex = index;
    }
    const dd = peak === 0 ? 0 : (value / peak - 1) * 100;
    series.push(dd);
    if (dd < worst) {
      worst = dd;
      bestPeak = peakIndex;
      bestTrough = index;
    }
  });
  return {
    maxDrawdown: worst,
    peakIndex: bestPeak,
    troughIndex: bestTrough,
    series: series.map((v) => roundTo(v, 3)),
  };
}

export function sharpeRatio(returns: number[], riskFreeAnnual = 0.02, periodsPerYear = 252): number {
  if (returns.length < 2) return 0;
  const rfPerPeriod = riskFreeAnnual / periodsPerYear;
  const excess = returns.map((r) => r - rfPerPeriod);
  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const variance = excess.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (excess.length - 1);
  const sd = Math.sqrt(variance);
  if (sd === 0) return 0;
  return (mean / sd) * Math.sqrt(periodsPerYear);
}

export function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const x = a.slice(a.length - n);
  const y = b.slice(b.length - n);
  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

export function correlationMatrix(seriesMap: Record<string, number[]>): {
  symbols: string[];
  matrix: number[][];
} {
  const symbols = Object.keys(seriesMap);
  const matrix = symbols.map((a) =>
    symbols.map((b) => {
      if (a === b) return 1;
      return roundTo(pearsonCorrelation(seriesMap[a], seriesMap[b]), 2);
    }),
  );
  return { symbols, matrix };
}

/** Herfindahl-Hirschman index of portfolio weights, expressed 0–10000. */
export function concentrationIndex(weights: number[]): number {
  return roundTo(
    weights.reduce((sum, w) => sum + w * w, 0),
    0,
  );
}

export function normalizedSeries(values: number[]): number[] {
  if (values.length === 0 || values[0] === 0) return values.map(() => 0);
  const base = values[0];
  return values.map((v) => roundTo((v / base) * 100, 2));
}

export interface Contribution {
  symbol: string;
  returnPercent: number;
  weight: number;
  contribution: number;
}

export function returnContributions(
  weights: Record<string, number>,
  returns: Record<string, number>,
): Contribution[] {
  return Object.keys(weights).map((symbol) => ({
    symbol,
    returnPercent: roundTo(returns[symbol] ?? 0, 2),
    weight: roundTo(weights[symbol], 2),
    contribution: roundTo((weights[symbol] / 100) * (returns[symbol] ?? 0), 3),
  }));
}

export function downsideDeviation(returns: number[], periodsPerYear = 252): number {
  const negative = returns.filter((r) => r < 0);
  if (negative.length === 0) return 0;
  const variance = negative.reduce((sum, r) => sum + r * r, 0) / negative.length;
  return Math.sqrt(variance) * Math.sqrt(periodsPerYear) * 100;
}
