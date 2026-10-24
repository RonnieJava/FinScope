import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import clsx from 'clsx';
import { getAssetsWithQuotes, searchAssets } from '@/services/data';
import { useFormatters } from '@/hooks/useFormatters';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useRecentStore } from '@/store/recent';
import type { AssetWithQuote } from '@/services/data';

function classBadge(assetClass: string): string {
  switch (assetClass) {
    case 'etf':
      return 'ETF';
    case 'index':
      return 'IDX';
    case 'crypto':
      return 'CRY';
    default:
      return 'STK';
  }
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const formatters = useFormatters();
  const visit = useRecentStore((state) => state.visit);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(wrapperRef, () => setOpen(false), open);

  const results = useMemo<AssetWithQuote[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return getAssetsWithQuotes(['AAPL', 'NVDA', 'SPY', 'BTC-USD', 'SPX']).slice(0, 5);
    }
    const matches = searchAssets(trimmed).slice(0, 7);
    return getAssetsWithQuotes(matches.map((asset) => asset.symbol));
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const choose = (symbol: string) => {
    visit(symbol);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    navigate(`/assets/${symbol}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      const target = results[activeIndex];
      if (target) {
        event.preventDefault();
        choose(target.asset.symbol);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[420px]">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search symbols, names, sectors…"
          aria-label="Global asset search"
          aria-expanded={open}
          role="combobox"
          aria-controls="global-search-results"
          className="fs-input h-9 pl-8 pr-12 text-xs"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-subtle">
          <kbd className="fs-kbd">⌘</kbd>
          <kbd className="fs-kbd">K</kbd>
        </span>
      </div>

      {open ? (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-border bg-panel-2 shadow-pop"
        >
          <p className="border-b border-border px-3 py-1.5 text-2xs uppercase tracking-[0.14em] text-subtle">
            {query.trim() ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Quick access'}
          </p>
          {results.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted">No demo asset matches “{query.trim()}”.</p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto py-1">
              {results.map((row, index) => (
                <li key={row.asset.symbol}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(row.asset.symbol)}
                    className={clsx(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                      index === activeIndex ? 'bg-panel-3' : 'hover:bg-panel-3',
                    )}
                  >
                    <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded border border-border bg-panel text-[9px] font-semibold uppercase tracking-wide text-muted">
                      {classBadge(row.asset.class)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-fg">{row.asset.symbol}</span>
                      <span className="block truncate text-2xs text-subtle">{row.asset.name}</span>
                    </span>
                    <span className="text-right">
                      <span className="fs-num block text-xs text-fg">
                        {formatters.price(row.quote.price, row.asset.class === 'crypto' ? 4 : 2)}
                      </span>
                      <span
                        className={clsx(
                          'fs-num block text-2xs',
                          row.quote.changePercent >= 0 ? 'text-up' : 'text-down',
                        )}
                      >
                        {formatters.percent(row.quote.changePercent)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="flex items-center gap-1 border-t border-border px-3 py-1.5 text-2xs text-subtle">
            <CornerDownLeft size={11} /> open · <span className="fs-kbd">Esc</span> close
          </p>
        </div>
      ) : null}
    </div>
  );
}
