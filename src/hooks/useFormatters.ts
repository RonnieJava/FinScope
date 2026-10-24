import { useMemo } from 'react';
import {
  CURRENCY_SYMBOL,
  formatBigNumber,
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatPrice,
  formatSignedNumber,
  convertFromUsd,
} from '@/utils/format';
import { useSettingsStore } from '@/store/settings';

export interface Formatters {
  baseCurrency: ReturnType<typeof useSettingsStore.getState>['baseCurrency'];
  currencySymbol: string;
  /** Prices are quoted in USD; this converts when a different base currency is selected. */
  price: (value: number, decimals?: number) => string;
  percent: (value: number, decimals?: number, withSign?: boolean) => string;
  signed: (value: number, decimals?: number) => string;
  money: (valueUsd: number) => string;
  compact: (value: number) => string;
  big: (value: number) => string;
  dateTime: (iso: string) => string;
  raw: (value: number) => number;
}

export function useFormatters(): Formatters {
  const baseCurrency = useSettingsStore((state) => state.baseCurrency);
  const numberFormat = useSettingsStore((state) => state.numberFormat);

  return useMemo<Formatters>(
    () => ({
      baseCurrency,
      currencySymbol: CURRENCY_SYMBOL[baseCurrency],
      price: (value, decimals = 2) => formatPrice(convertFromUsd(value, baseCurrency), decimals),
      percent: (value, decimals = 2, withSign = true) =>
        formatPercent(value, decimals, withSign),
      signed: (value, decimals = 2) =>
        formatSignedNumber(convertFromUsd(value, baseCurrency), decimals),
      money: (valueUsd) => formatCurrency(convertFromUsd(valueUsd, baseCurrency), baseCurrency),
      compact: (value) => formatCompactNumber(value),
      big: (value) => formatBigNumber(value, numberFormat),
      dateTime: (iso) => formatDateTime(iso),
      raw: (value) => convertFromUsd(value, baseCurrency),
    }),
    [baseCurrency, numberFormat],
  );
}
