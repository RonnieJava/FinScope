import { useMemo } from 'react';
import { getAssetsWithQuotes } from '@/services/data';
import type { AssetWithQuote } from '@/services/data';

/** Stable, memoised view over the demo asset + quote dataset. */
export function useAssetsWithQuotes(symbols?: string[]): AssetWithQuote[] {
  return useMemo(() => getAssetsWithQuotes(symbols), [symbols]);
}
