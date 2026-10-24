import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useSettingsStore } from '@/store/settings';

interface MarketColorToggleProps {
  withLabel?: boolean;
}

/**
 * Toggles the semantic up/down palette between the CN convention (red = up)
 * and the US convention (green = up). Only the meaning of --up/--down changes,
 * every number, badge and chart picks it up through CSS variables.
 */
export function MarketColorToggle({ withLabel = false }: MarketColorToggleProps) {
  const marketColors = useSettingsStore((state) => state.marketColors);
  const toggleMarketColors = useSettingsStore((state) => state.toggleMarketColors);
  const redUp = marketColors === 'red-up';

  return (
    <button
      type="button"
      onClick={toggleMarketColors}
      className="fs-btn h-9 gap-2 px-2.5"
      aria-label={`Market colours: ${redUp ? 'red up, green down' : 'green up, red down'}. Click to switch.`}
      title={redUp ? 'Red up / green down — click for green up' : 'Green up / red down — click for red up'}
    >
      <span className="flex items-center gap-0.5">
        <ArrowUpRight size={13} style={{ color: 'var(--up)' }} />
        <ArrowDownRight size={13} style={{ color: 'var(--down)' }} />
      </span>
      {withLabel ? <span className="text-xs">{redUp ? 'Red ↑' : 'Green ↑'}</span> : null}
    </button>
  );
}
