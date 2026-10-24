import type { Asset, AssetClass } from '@/types';
import { ASSET_SEEDS } from '@/mocks/universe';

export const ASSETS: Asset[] = ASSET_SEEDS.map(({ symbol, name, class: assetClass, exchange, sector, currency, description }) => ({
  symbol,
  name,
  class: assetClass,
  exchange,
  sector,
  currency,
  description,
}));

const bySymbol = new Map(ASSETS.map((asset) => [asset.symbol, asset]));

export function getAsset(symbol: string): Asset | undefined {
  return bySymbol.get(symbol.toUpperCase());
}

export function getAssetsByClass(assetClass: AssetClass | 'all'): Asset[] {
  if (assetClass === 'all') return ASSETS;
  return ASSETS.filter((asset) => asset.class === assetClass);
}

export function searchAssets(query: string, assetClass: AssetClass | 'all' = 'all'): Asset[] {
  const needle = query.trim().toLowerCase();
  const pool = getAssetsByClass(assetClass);
  if (!needle) return pool;
  return pool.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(needle) ||
      asset.name.toLowerCase().includes(needle) ||
      asset.sector.toLowerCase().includes(needle),
  );
}

/** Assets in the same class (used for "related assets"). */
export function getRelatedAssets(symbol: string, limit = 6): Asset[] {
  const asset = getAsset(symbol);
  if (!asset) return [];
  const sameSector = ASSETS.filter(
    (candidate) => candidate.symbol !== asset.symbol && candidate.sector === asset.sector,
  );
  const sameClass = ASSETS.filter(
    (candidate) =>
      candidate.symbol !== asset.symbol &&
      candidate.class === asset.class &&
      !sameSector.some((match) => match.symbol === candidate.symbol),
  );
  return [...sameSector, ...sameClass].slice(0, limit);
}
