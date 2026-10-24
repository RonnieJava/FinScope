import { useState, type ReactNode } from 'react';
import { Check, Database, RotateCcw, SlidersHorizontal, Palette, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { RangeTabs } from '@/components/ui/RangeTabs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MarketColorToggle } from '@/components/ui/MarketColorToggle';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useSettingsStore } from '@/store/settings';
import { toastInfo } from '@/store/toast';
import type { AssetClass, BaseCurrency, NumberFormatPreference, ThemeMode } from '@/types';

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  preview?: ReactNode;
}

interface OptionGroupProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: Array<Option<T>>;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}

function OptionGroup<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
  columns = 2,
}: OptionGroupProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="fs-label">{label}</legend>
      {description ? <p className="mb-2 text-2xs leading-relaxed text-subtle">{description}</p> : null}
      <div className={clsx('grid gap-2', columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2')}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={clsx(
                'group relative flex min-h-[44px] flex-col gap-1 rounded border px-3 py-2 text-left transition-colors',
                active
                  ? 'border-accent/60 bg-accent-soft text-fg'
                  : 'border-border bg-panel-2 text-muted hover:border-border-strong hover:text-fg',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-tight">{option.label}</span>
                {active ? <Check size={13} className="shrink-0 text-accent" /> : null}
              </span>
              {option.hint ? <span className="text-2xs leading-snug text-subtle">{option.hint}</span> : null}
              {option.preview}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium text-fg">{label}</p>
        <p className="mt-0.5 text-2xs leading-relaxed text-subtle">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-accent/50 bg-accent/70' : 'border-border bg-panel-3',
        )}
      >
        <span
          className={clsx(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-fg shadow-sm transition-all',
            checked ? 'left-[calc(100%-1.125rem)]' : 'left-1',
          )}
        />
      </button>
    </div>
  );
}

const THEME_OPTIONS: Array<Option<ThemeMode>> = [
  {
    value: 'dark',
    label: 'Dark terminal',
    hint: 'Default. OLED-leaning panels for dense data.',
    preview: (
      <span className="mt-1 flex h-6 overflow-hidden rounded-sm border border-white/10">
        <span className="w-1/3 bg-[#0B0F14]" />
        <span className="w-1/3 bg-[#111821]" />
        <span className="w-1/3 bg-[#4F8CFF]/70" />
      </span>
    ),
  },
  {
    value: 'light',
    label: 'Light workspace',
    hint: 'Higher-contrast daylight variant of the same tokens.',
    preview: (
      <span className="mt-1 flex h-6 overflow-hidden rounded-sm border border-black/10">
        <span className="w-1/3 bg-[#F6F8FB]" />
        <span className="w-1/3 bg-white" />
        <span className="w-1/3 bg-[#2563EB]/70" />
      </span>
    ),
  },
];

const ASSET_CLASS_OPTIONS: Array<Option<AssetClass | 'all'>> = [
  { value: 'all', label: 'All assets', hint: 'Mixed universe' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'index', label: 'Indices' },
  { value: 'crypto', label: 'Crypto' },
];

const NUMBER_OPTIONS: Array<Option<NumberFormatPreference>> = [
  { value: 'compact', label: 'Compact', hint: '1.24M · 38.2K' },
  { value: 'standard', label: 'Standard', hint: '1,240,000 · 38,200' },
];

const CURRENCY_OPTIONS: Array<Option<BaseCurrency>> = [
  { value: 'USD', label: 'USD', hint: 'US dollar (native demo quote)' },
  { value: 'CNY', label: 'CNY', hint: 'Converted with a fixed demo FX rate' },
  { value: 'EUR', label: 'EUR', hint: 'Converted with a fixed demo FX rate' },
];

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    settings.reset();
    setConfirmReset(false);
    toastInfo('Preferences restored', 'Theme, colours, defaults and currency are back to factory values.');
  };

  const marketColorPreview = (
    <div className="mt-1 flex items-center gap-3 text-2xs">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--up)' }} />
        Up
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--down)' }} />
        Down
      </span>
    </div>
  );

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-fg">Settings</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 text-xs text-muted">
            Preferences are stored in this browser only (localStorage) and apply immediately across every page.
          </p>
        </div>
        <button type="button" className="fs-btn h-8 px-2.5 text-xs" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={13} />
          Restore defaults
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel title="Appearance" subtitle="Theme and market colour convention" actions={<Palette size={14} className="text-subtle" />}>
          <div className="space-y-5">
            <OptionGroup
              label="Theme"
              description="Both themes use the same spacing, typography and chart tokens."
              value={settings.theme}
              options={THEME_OPTIONS}
              onChange={settings.setTheme}
            />

            <OptionGroup
              label="Market colour convention"
              description="Changes only the semantic meaning of the up/down tokens; every number, badge and chart follows."
              value={settings.marketColors}
              options={[
                { value: 'red-up', label: 'Red up / green down', hint: 'CN convention', preview: marketColorPreview },
                { value: 'green-up', label: 'Green up / red down', hint: 'US convention', preview: marketColorPreview },
              ]}
              onChange={settings.setMarketColors}
            />

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <ThemeToggle withLabel />
              <MarketColorToggle withLabel />
              <span className="text-2xs text-subtle">Same toggles as the top bar</span>
            </div>

            <div className="border-t border-border pt-3">
              <Switch
                label="Collapse sidebar by default"
                description="Keeps the icon rail on desktop. You can expand it at any time from the sidebar header."
                checked={settings.sidebarCollapsed}
                onChange={settings.setSidebarCollapsed}
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Defaults"
          subtitle="Starting state for markets and charts"
          actions={<SlidersHorizontal size={14} className="text-subtle" />}
        >
          <div className="space-y-5">
            <OptionGroup
              label="Default asset class"
              description="Applied when you open the Markets page."
              value={settings.defaultAssetClass}
              options={ASSET_CLASS_OPTIONS}
              onChange={settings.setDefaultAssetClass}
              columns={3}
            />

            <div>
              <span className="fs-label">Default chart range</span>
              <p className="mb-2 text-2xs leading-relaxed text-subtle">
                Used by new chart views on asset pages and the dashboard.
              </p>
              <RangeTabs value={settings.defaultTimeRange} onChange={settings.setDefaultTimeRange} />
            </div>

            <OptionGroup
              label="Number format"
              description="Controls volume and compact figures outside of price columns."
              value={settings.numberFormat}
              options={NUMBER_OPTIONS}
              onChange={settings.setNumberFormat}
            />

            <OptionGroup
              label="Base currency"
              description="Demo quotes are stored in USD and converted with fixed FX rates. No live FX feed is used."
              value={settings.baseCurrency}
              options={CURRENCY_OPTIONS}
              onChange={settings.setBaseCurrency}
              columns={3}
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel title="Data & storage" subtitle="Everything stays on this device" actions={<Database size={14} className="text-subtle" />}>
          <div className="space-y-2.5 text-xs leading-relaxed text-muted">
            <p>
              FinScope has no backend. Quotes, candles, news, calendar events and portfolio seeds are generated from a
              deterministic local mock layer.
            </p>
            <dl className="grid gap-1.5">
              {[
                ['finscope.settings.v1', 'Theme, colour convention, defaults, currency, sidebar'],
                ['finscope.watchlist.v1', 'Symbols you starred'],
                ['finscope.portfolio.v1', 'Demo transactions and starting cash'],
                ['finscope.recent.v1', 'Recently viewed assets'],
              ].map(([key, description]) => (
                <div key={key} className="flex flex-col gap-0.5 rounded border border-border bg-panel-2 px-2.5 py-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <dt className="fs-num text-2xs text-fg">{key}</dt>
                  <dd className="text-2xs text-subtle sm:text-right">{description}</dd>
                </div>
              ))}
            </dl>
            <p className="text-2xs text-subtle">
              Clearing site data in your browser erases watchlist, transactions and preferences. Nothing is uploaded.
            </p>
          </div>
        </Panel>

        <Panel title="About FinScope" subtitle="Demo build" actions={<ShieldCheck size={14} className="text-subtle" />}>
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <dt className="text-muted">Version</dt>
              <dd className="fs-num text-fg">1.0.0</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <dt className="text-muted">Data source</dt>
              <dd className="text-fg">Local deterministic mocks</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <dt className="text-muted">Demo clock</dt>
              <dd className="fs-num text-fg">2026-10-23 15:42 ET</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Backend / broker</dt>
              <dd className="text-fg">None — front end only</dd>
            </div>
          </dl>
          <p className="mt-3 rounded border border-warn/25 bg-warn/10 px-3 py-2 text-2xs leading-relaxed text-warn">
            FinScope is an educational interface demo. Nothing here is investment advice, a quote, or an order route.
          </p>
        </Panel>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Restore default preferences?"
        description="Theme, market colours, default asset class, chart range, number format, base currency and sidebar state will return to factory values. Watchlist and portfolio data are not affected."
        confirmLabel="Restore defaults"
        tone="primary"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
