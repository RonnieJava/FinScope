import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Newspaper, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { Modal } from '@/components/ui/Modal';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { NewsCard } from '@/components/news/NewsCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getNews } from '@/services/data';
import { formatDateTime, timeAgo } from '@/utils/format';
import { DEMO_NOW } from '@/utils/date';
import type { NewsItem } from '@/types';

type CategoryFilter = NewsItem['category'] | 'all';
type DateFilter = 'all' | 'today' | '7d' | '30d';

const CATEGORIES: CategoryFilter[] = [
  'all',
  'Markets',
  'Earnings',
  'Economy',
  'Crypto',
  'Policy',
  'Technology',
];

const DATE_FILTERS: Array<{ value: DateFilter; label: string; hours: number }> = [
  { value: 'all', label: 'All dates', hours: Number.POSITIVE_INFINITY },
  { value: 'today', label: 'Last 24 hours', hours: 24 },
  { value: '7d', label: 'Last 7 days', hours: 24 * 7 },
  { value: '30d', label: 'Last 30 days', hours: 24 * 30 },
];

const NEWS = getNews();

export default function NewsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selected, setSelected] = useState<NewsItem | null>(null);

  const items = useMemo(() => {
    const term = query.trim().toLowerCase();
    const window = DATE_FILTERS.find((option) => option.value === dateFilter)?.hours ?? Number.POSITIVE_INFINITY;
    const cutoff = DEMO_NOW.getTime() - window * 3600_000;

    return NEWS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (dateFilter !== 'all' && new Date(item.publishedAt).getTime() < cutoff) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term) ||
        item.source.toLowerCase().includes(term) ||
        item.symbols.some((symbol) => symbol.toLowerCase().includes(term))
      );
    });
  }, [category, dateFilter, query]);

  const related = useMemo(() => {
    if (!selected) return [];
    const sameCategory = NEWS.filter((item) => item.id !== selected.id && item.category === selected.category);
    const sharedSymbol = NEWS.filter(
      (item) =>
        item.id !== selected.id &&
        item.category !== selected.category &&
        item.symbols.some((symbol) => selected.symbols.includes(symbol)),
    );
    return [...sameCategory, ...sharedSymbol].slice(0, 3);
  }, [selected]);

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-fg">Market News</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 text-xs text-muted">
            {items.length} of {NEWS.length} demo stories · every article is fictional and marked DEMO
          </p>
        </div>
        <div className="flex items-center gap-2 text-2xs text-subtle">
          <Clock3 size={12} />
          <span>Snapshot {formatDateTime(DEMO_NOW.toISOString())}</span>
        </div>
      </header>

      <DemoDataBadge variant="banner" message="DEMO NEWS — FICTIONAL CONTENT, NOT REAL REPORTING" />

      <Panel flush>
        <div className="flex flex-col gap-2.5 border-b border-border px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="fs-scroll-x flex min-w-0 items-center gap-1.5 pb-0.5">
            {CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
                className={clsx('fs-chip h-7 shrink-0 px-2.5 text-xs', category === value && 'fs-chip-active')}
              >
                {value === 'all' ? 'All' : value}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search headlines, tickers, source"
                aria-label="Search demo news"
                className="fs-input h-8 w-full pl-8 text-xs sm:w-64"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              aria-label="Filter news by date"
              className="fs-select h-8 text-xs"
            >
              {DATE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<Newspaper size={18} />}
            title="No demo stories match those filters"
            description="Try a different keyword, category or date window. All articles in FinScope are synthetic."
            action={
              <button
                type="button"
                className="fs-btn h-8"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                  setDateFilter('all');
                }}
              >
                <X size={13} />
                Clear filters
              </button>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-y-0">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={clsx(
                  'min-w-0 px-4 py-3.5 transition-colors hover:bg-panel-2/50',
                  'lg:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-border',
                  index >= 2 && 'lg:border-t lg:border-border',
                )}
              >
                <NewsCard item={item} onOpen={setSelected} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Newsroom notes" subtitle="How demo content is produced">
        <ul className="space-y-1.5 text-xs leading-relaxed text-muted">
          <li>· Every headline, body paragraph and source name is fabricated for demonstration.</li>
          <li>· No real news organisation, article URL or external feed is referenced.</li>
          <li>· Tickers mentioned in an article link to local demo asset pages only.</li>
          <li>· Timestamps are anchored to the frozen demo clock, so the list never reorders on reload.</li>
        </ul>
      </Panel>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title}
        labelledBy="news-dialog-title"
        subtitle={
          selected ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="fs-chip h-5 px-1.5 text-[10px]">{selected.category}</span>
              <DemoDataBadge className="h-5 px-1.5 text-[10px]" />
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={11} />
                {formatDateTime(selected.publishedAt)}
              </span>
              <span aria-hidden>·</span>
              <span>{timeAgo(selected.publishedAt, DEMO_NOW)}</span>
              <span aria-hidden>·</span>
              <span>{selected.readTimeMin} min read</span>
            </div>
          ) : null
        }
        footer={
          <button type="button" className="fs-btn h-8" onClick={() => setSelected(null)}>
            Close
          </button>
        }
      >
        {selected ? (
          <article className="space-y-3">
            <p className="rounded border border-warn/25 bg-warn/10 px-3 py-2 text-2xs leading-relaxed text-warn">
              This article is fictional demo content. It does not describe real market events and must not be
              treated as investment information.
            </p>

            <p className="text-sm leading-relaxed text-fg">{selected.summary}</p>

            {selected.body.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-xs leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-2xs uppercase tracking-[0.12em] text-subtle">Mentioned</span>
              {selected.symbols.map((symbol) => (
                <Link
                  key={symbol}
                  to={`/assets/${symbol}`}
                  onClick={() => setSelected(null)}
                  className="fs-chip fs-num h-6 px-2 text-2xs transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {symbol}
                </Link>
              ))}
            </div>

            <p className="text-2xs text-subtle">Source: {selected.source} · synthetic publication</p>
          </article>
        ) : null}

        {selected && related.length > 0 ? (
          <section className="mt-4 border-t border-border pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Related demo stories</h3>
            <ul className="mt-2 divide-y divide-border">
              {related.map((item) => (
                <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                  <NewsCard item={item} onOpen={setSelected} compact />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Modal>
    </div>
  );
}
