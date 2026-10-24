import { describe, expect, it } from 'vitest';
import {
  annualizedVolatility,
  concentrationIndex,
  correlationMatrix,
  cumulativeReturn,
  dailyReturns,
  downsideDeviation,
  maxDrawdown,
  normalizedSeries,
  pearsonCorrelation,
  returnContributions,
  sharpeRatio,
} from '@/utils/analytics';

describe('dailyReturns', () => {
  it('computes simple period-over-period returns', () => {
    const result = dailyReturns([100, 110, 99]);
    expect(result[0]).toBeCloseTo(0.1, 10);
    expect(result[1]).toBeCloseTo(-0.1, 10);
  });

  it('returns 0 when the previous value is zero', () => {
    expect(dailyReturns([0, 10])).toEqual([0]);
  });

  it('returns an empty array for a single observation', () => {
    expect(dailyReturns([100])).toEqual([]);
  });
});

describe('cumulativeReturn', () => {
  it('reports total return as a percentage', () => {
    expect(cumulativeReturn([100, 120, 150])).toBeCloseTo(50, 10);
  });

  it('handles losses', () => {
    expect(cumulativeReturn([200, 150])).toBeCloseTo(-25, 10);
  });

  it('guards against short and zero-based series', () => {
    expect(cumulativeReturn([100])).toBe(0);
    expect(cumulativeReturn([0, 10])).toBe(0);
  });
});

describe('annualizedVolatility', () => {
  it('is zero for a constant return series', () => {
    expect(annualizedVolatility([0.01, 0.01, 0.01])).toBe(0);
  });

  it('annualizes the sample standard deviation', () => {
    const result = annualizedVolatility([0.01, -0.01]);
    const expected = Math.sqrt(0.0002) * Math.sqrt(252) * 100;
    expect(result).toBeCloseTo(expected, 8);
  });

  it('returns 0 with fewer than two observations', () => {
    expect(annualizedVolatility([0.01])).toBe(0);
    expect(annualizedVolatility([])).toBe(0);
  });
});

describe('maxDrawdown', () => {
  it('finds the deepest peak-to-trough decline and its indices', () => {
    const result = maxDrawdown([100, 120, 90, 110]);
    expect(result.maxDrawdown).toBeCloseTo(-25, 3);
    expect(result.peakIndex).toBe(1);
    expect(result.troughIndex).toBe(2);
    expect(result.series).toEqual([0, 0, -25, -8.333]);
  });

  it('reports no drawdown for a monotonically rising series', () => {
    const result = maxDrawdown([100, 110, 120]);
    expect(result.maxDrawdown).toBe(0);
    expect(result.series).toEqual([0, 0, 0]);
  });

  it('handles an empty series', () => {
    expect(maxDrawdown([])).toEqual({ maxDrawdown: 0, peakIndex: -1, troughIndex: -1, series: [] });
  });
});

describe('sharpeRatio', () => {
  it('is zero when returns have no dispersion', () => {
    expect(sharpeRatio([0.01, 0.01, 0.01])).toBe(0);
  });

  it('is positive for a positive drift and negative for a losing series', () => {
    expect(sharpeRatio([0.02, 0.01, 0.03, 0.015, 0.025])).toBeGreaterThan(0);
    expect(sharpeRatio([-0.02, -0.01, -0.03, -0.015, -0.025])).toBeLessThan(0);
  });

  it('returns 0 with fewer than two observations', () => {
    expect(sharpeRatio([0.01])).toBe(0);
  });
});

describe('pearsonCorrelation', () => {
  it('detects perfect positive and negative relationships', () => {
    expect(pearsonCorrelation([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 10);
    expect(pearsonCorrelation([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1, 10);
  });

  it('returns 0 for a flat series or insufficient data', () => {
    expect(pearsonCorrelation([1, 1, 1], [1, 2, 3])).toBe(0);
    expect(pearsonCorrelation([1], [2])).toBe(0);
  });

  it('aligns on the tail when lengths differ', () => {
    expect(pearsonCorrelation([99, 1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });
});

describe('correlationMatrix', () => {
  it('is symmetric with a unit diagonal rounded to two decimals', () => {
    const { symbols, matrix } = correlationMatrix({
      AAA: [1, 2, 3, 4],
      BBB: [4, 3, 2, 1],
      CCC: [1, 3, 2, 5],
    });
    expect(symbols).toEqual(['AAA', 'BBB', 'CCC']);
    matrix.forEach((row, i) => {
      expect(row[i]).toBe(1);
      matrix.forEach((_, j) => {
        expect(row[j]).toBe(matrix[j][i]);
      });
    });
    expect(matrix[0][1]).toBe(-1);
  });
});

describe('concentrationIndex', () => {
  it('returns the Herfindahl-Hirschman index on a 0–10000 scale', () => {
    expect(concentrationIndex([50, 50])).toBe(5000);
    expect(concentrationIndex([100])).toBe(10000);
    expect(concentrationIndex([25, 25, 25, 25])).toBe(2500);
  });
});

describe('normalizedSeries', () => {
  it('rebases the series to 100', () => {
    expect(normalizedSeries([100, 110, 90])).toEqual([100, 110, 90]);
    expect(normalizedSeries([50, 75, 25])).toEqual([100, 150, 50]);
  });

  it('returns zeros when the base is zero or the series is empty', () => {
    expect(normalizedSeries([0, 10])).toEqual([0, 0]);
    expect(normalizedSeries([])).toEqual([]);
  });
});

describe('returnContributions', () => {
  it('weights each asset return by its portfolio weight', () => {
    const result = returnContributions(
      { AAPL: 60, MSFT: 40 },
      { AAPL: 10, MSFT: -5 },
    );
    expect(result).toEqual([
      { symbol: 'AAPL', returnPercent: 10, weight: 60, contribution: 6 },
      { symbol: 'MSFT', returnPercent: -5, weight: 40, contribution: -2 },
    ]);
  });

  it('treats a missing return as zero', () => {
    const result = returnContributions({ NVDA: 100 }, {});
    expect(result[0].contribution).toBe(0);
    expect(result[0].returnPercent).toBe(0);
  });
});

describe('downsideDeviation', () => {
  it('is zero when there are no negative returns', () => {
    expect(downsideDeviation([0.01, 0.02])).toBe(0);
  });

  it('annualizes only the negative observations', () => {
    const result = downsideDeviation([-0.02, 0.01]);
    expect(result).toBeCloseTo(Math.sqrt(0.0004) * Math.sqrt(252) * 100, 8);
  });
});
