import { describe, expect, it } from 'vitest';
import {
  assetDecimals,
  clamp,
  convertFromUsd,
  formatBigNumber,
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatMoneyFromUsd,
  formatPercent,
  formatPrice,
  formatSignedNumber,
  fxRate,
  pnlTone,
  roundTo,
  timeAgo,
} from '@/utils/format';

describe('formatPrice', () => {
  it('formats with grouped thousands and fixed decimals', () => {
    expect(formatPrice(1234.5)).toBe('1,234.50');
    expect(formatPrice(0.123456, 4)).toBe('0.1235');
  });

  it('returns an em dash for non-finite input', () => {
    expect(formatPrice(Number.NaN)).toBe('—');
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('formatPercent', () => {
  it('adds a plus sign for gains and keeps the minus for losses', () => {
    expect(formatPercent(1.234)).toBe('+1.23%');
    expect(formatPercent(-4.56)).toBe('-4.56%');
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('can omit the sign and respects the decimal count', () => {
    expect(formatPercent(1.234, 1, false)).toBe('1.2%');
  });

  it('returns an em dash for non-finite input', () => {
    expect(formatPercent(Number.NaN)).toBe('—');
  });
});

describe('formatSignedNumber', () => {
  it('prefixes positive values with a plus sign', () => {
    expect(formatSignedNumber(12.5)).toBe('+12.50');
    expect(formatSignedNumber(-3.25)).toBe('-3.25');
  });
});

describe('formatCompactNumber', () => {
  it('abbreviates thousands, millions, billions and trillions', () => {
    expect(formatCompactNumber(2_500)).toBe('2.50K');
    expect(formatCompactNumber(1_240_000)).toBe('1.24M');
    expect(formatCompactNumber(3_200_000_000)).toBe('3.20B');
    expect(formatCompactNumber(4_500_000_000_000)).toBe('4.50T');
    expect(formatCompactNumber(4.5)).toBe('4.50');
  });
});

describe('formatBigNumber', () => {
  it('uses compact notation by default and grouped digits in standard mode', () => {
    expect(formatBigNumber(1_240_000)).toBe('1.24M');
    expect(formatBigNumber(1_240_000, 'standard')).toBe('1,240,000');
  });
});

describe('formatCurrency', () => {
  it('formats US dollars with a currency symbol', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
  });
});

describe('currency conversion', () => {
  it('exposes fixed demo FX rates', () => {
    expect(fxRate('USD')).toBe(1);
    expect(fxRate('CNY')).toBeCloseTo(7.12, 10);
    expect(fxRate('EUR')).toBeCloseTo(0.92, 10);
  });

  it('converts and formats USD amounts', () => {
    expect(convertFromUsd(100, 'CNY')).toBeCloseTo(712, 10);
    expect(formatMoneyFromUsd(100, 'USD')).toBe('$100.00');
  });
});

describe('numeric helpers', () => {
  it('clamps values into a range', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });

  it('rounds half values up at the requested precision', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(2.34567, 3)).toBe(2.346);
  });
});

describe('assetDecimals', () => {
  it('uses four decimals for sub-dollar crypto and two elsewhere', () => {
    expect(assetDecimals('crypto', 0.5)).toBe(4);
    expect(assetDecimals('crypto', 45_000)).toBe(2);
    expect(assetDecimals('stock', 0.5)).toBe(2);
    expect(assetDecimals('index', 4500)).toBe(2);
  });
});

describe('pnlTone', () => {
  it('maps profit, loss and flat values to semantic tones', () => {
    expect(pnlTone(10)).toBe('up');
    expect(pnlTone(-10)).toBe('down');
    expect(pnlTone(0)).toBe('flat');
  });
});

describe('date formatting', () => {
  it('renders a readable month for a valid ISO timestamp', () => {
    expect(formatDateTime('2026-10-23T19:42:00.000Z')).toMatch(/Oct/);
  });

  it('describes relative time against an explicit now', () => {
    const now = new Date('2026-10-23T19:42:00.000Z');
    expect(timeAgo('2026-10-23T19:32:00.000Z', now)).toBe('10m ago');
    expect(timeAgo('2026-10-23T14:42:00.000Z', now)).toBe('5h ago');
    expect(timeAgo('2026-10-20T19:42:00.000Z', now)).toBe('3d ago');
  });
});
