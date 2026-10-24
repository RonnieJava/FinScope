import { describe, expect, it } from 'vitest';
import { ema, macd, periodReturn, rsi, sma } from '@/utils/indicators';

const ramp = (length: number, start = 1, step = 1) =>
  Array.from({ length }, (_, i) => start + i * step);

describe('sma', () => {
  it('leaves leading slots empty and averages each trailing window', () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it('returns all nulls when there is not enough data', () => {
    expect(sma([1, 2], 3)).toEqual([null, null]);
  });

  it('returns all nulls for an invalid period', () => {
    expect(sma([1, 2, 3], 0)).toEqual([null, null, null]);
  });
});

describe('ema', () => {
  it('seeds with the simple average then applies the smoothing factor', () => {
    const result = ema([1, 2, 3, 4, 5], 3);
    expect(result.slice(0, 2)).toEqual([null, null]);
    expect(result[2]).toBeCloseTo(2, 10);
    expect(result[3]).toBeCloseTo(3, 10);
    expect(result[4]).toBeCloseTo(4, 10);
  });

  it('returns all nulls when there is not enough data', () => {
    expect(ema([1, 2], 3)).toEqual([null, null]);
  });
});

describe('rsi', () => {
  it('reaches 100 for a strictly rising series', () => {
    const result = rsi(ramp(16), 14);
    expect(result[14]).toBeCloseTo(100, 10);
    expect(result[15]).toBeCloseTo(100, 10);
  });

  it('reaches 0 for a strictly falling series', () => {
    const result = rsi(ramp(16).reverse(), 14);
    expect(result[14]).toBeCloseTo(0, 10);
  });

  it('returns all nulls when the series is too short', () => {
    expect(rsi(ramp(14), 14).every((value) => value === null)).toBe(true);
  });

  it('stays within the 0–100 bounds for mixed data', () => {
    const values = [10, 11, 10.5, 12, 11.2, 13, 12.4, 14, 13.1, 15, 14.2, 16, 15.4, 17, 16.1, 18];
    rsi(values, 14).forEach((value) => {
      if (value !== null) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    });
  });
});

describe('macd', () => {
  it('produces a signal line that starts after the MACD line and a matching histogram', () => {
    const values = ramp(60, 100, 0.8);
    const result = macd(values);

    expect(result.macd[24]).toBeNull();
    expect(result.macd[25]).not.toBeNull();
    expect(result.signal.slice(0, 33).every((value) => value === null)).toBe(true);
    expect(result.signal[33]).not.toBeNull();
    expect(result.histogram[33]).not.toBeNull();

    const last = values.length - 1;
    expect(result.histogram[last]).toBeCloseTo(
      (result.macd[last] as number) - (result.signal[last] as number),
      10,
    );
  });

  it('returns positive MACD values for a rising series', () => {
    const result = macd(ramp(60, 100, 0.8));
    const last = result.macd[result.macd.length - 1] as number;
    expect(last).toBeGreaterThan(0);
  });

  it('returns all nulls when the series is shorter than the slow period', () => {
    const result = macd(ramp(10));
    expect(result.macd.every((value) => value === null)).toBe(true);
    expect(result.signal.every((value) => value === null)).toBe(true);
    expect(result.histogram.every((value) => value === null)).toBe(true);
  });
});

describe('periodReturn', () => {
  it('computes the percentage change across the window', () => {
    expect(periodReturn([100, 110])).toBeCloseTo(10, 10);
    expect(periodReturn([200, 150])).toBeCloseTo(-25, 10);
  });

  it('returns 0 for short or zero-based series', () => {
    expect(periodReturn([100])).toBe(0);
    expect(periodReturn([0, 50])).toBe(0);
  });
});
