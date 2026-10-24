import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Info } from 'lucide-react';
import clsx from 'clsx';
import { Panel } from '@/components/ui/Panel';
import { Modal } from '@/components/ui/Modal';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getCalendarEvents } from '@/services/data';
import { addMonths, monthLabel, toISODate } from '@/utils/date';
import type { EconomicEvent } from '@/types';

type CategoryFilter = EconomicEvent['category'] | 'all';

const CATEGORIES: CategoryFilter[] = ['all', 'Economy', 'Earnings', 'Central Bank', 'Crypto', 'Holiday'];

const IMPORTANCE_META: Record<EconomicEvent['importance'], { label: string; dot: string; text: string }> = {
  high: { label: 'High', dot: 'bg-warn', text: 'text-warn' },
  medium: { label: 'Medium', dot: 'bg-accent', text: 'text-accent' },
  low: { label: 'Low', dot: 'bg-subtle', text: 'text-subtle' },
};

const EVENTS = getCalendarEvents();
const DEMO_MONTH = new Date(Date.UTC(2026, 9, 1));
const DEMO_TODAY = '2026-10-23';

function formatDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const [month, setMonth] = useState<Date>(DEMO_MONTH);
  const [selectedDate, setSelectedDate] = useState<string>(DEMO_TODAY);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

  const filtered = useMemo(
    () => EVENTS.filter((event) => category === 'all' || event.category === category),
    [category],
  );

  const monthEvents = useMemo(
    () => filtered.filter((event) => event.date.startsWith(monthKey(month))),
    [filtered, month],
  );

  const dayEvents = useMemo(
    () => filtered.filter((event) => event.date === selectedDate),
    [filtered, selectedDate],
  );

  const importanceCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    for (const event of monthEvents) counts[event.importance] += 1;
    return counts;
  }, [monthEvents]);

  const shiftMonth = (offset: number) => {
    const next = addMonths(month, offset);
    setMonth(next);
    setSelectedDate(toISODate(next));
  };

  const jumpToToday = () => {
    setMonth(DEMO_MONTH);
    setSelectedDate(DEMO_TODAY);
  };

  const monthLabelText = monthLabel(month);
  const isCurrentDemoMonth = monthKey(month) === monthKey(DEMO_MONTH);

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-fg">Market Calendar</h1>
            <DemoDataBadge />
          </div>
          <p className="mt-1 text-xs text-muted">
            {monthEvents.length} demo event{monthEvents.length === 1 ? '' : 's'} in {monthLabelText} · all releases
            are synthetic
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className="fs-icon-btn h-8 w-8" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
            <ChevronLeft size={15} />
          </button>
          <span className="min-w-[132px] text-center text-xs font-semibold tracking-tight text-fg">
            {monthLabelText}
          </span>
          <button type="button" className="fs-icon-btn h-8 w-8" aria-label="Next month" onClick={() => shiftMonth(1)}>
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            className={clsx('fs-btn h-8 px-2.5 text-xs', isCurrentDemoMonth && 'text-muted')}
            onClick={jumpToToday}
          >
            Today
          </button>
        </div>
      </header>

      <DemoDataBadge variant="banner" message="DEMO CALENDAR — SYNTHETIC EVENTS, NOT AN ECONOMIC RELEASE SCHEDULE" />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          flush
          title={`${monthLabelText} events`}
          subtitle="Select a day to inspect its releases"
          actions={
            <div className="fs-scroll-x flex items-center gap-1">
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  aria-pressed={category === value}
                  className={clsx(
                    'fs-chip h-6 shrink-0 px-2 text-[10px]',
                    category === value && 'fs-chip-active',
                  )}
                >
                  {value === 'all' ? 'All' : value}
                </button>
              ))}
            </div>
          }
        >
          <CalendarGrid
            month={month}
            events={filtered}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
            <div className="flex flex-wrap items-center gap-3 text-2xs text-muted">
              {(Object.keys(IMPORTANCE_META) as Array<EconomicEvent['importance']>).map((key) => (
                <span key={key} className="inline-flex items-center gap-1.5">
                  <span className={clsx('h-1.5 w-1.5 rounded-full', IMPORTANCE_META[key].dot)} />
                  {IMPORTANCE_META[key].label}
                  <span className="fs-num text-fg">{importanceCounts[key]}</span>
                </span>
              ))}
            </div>
            <span className="text-2xs text-subtle">All times shown in ET (demo)</span>
          </div>
        </Panel>

        <Panel
          title={formatDay(selectedDate)}
          subtitle={`${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'} on this day`}
          actions={
            selectedDate !== DEMO_TODAY ? (
              <button type="button" className="fs-btn h-6 px-2 text-2xs" onClick={jumpToToday}>
                Jump to demo today
              </button>
            ) : (
              <span className="fs-chip h-5 px-1.5 text-[10px]">Demo today</span>
            )
          }
          className="min-w-0"
        >
          {dayEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={18} />}
              title="No demo events on this day"
              description="Pick another date on the grid, or switch the category filter. Dates without events are intentionally left quiet."
              className="py-8"
            />
          ) : (
            <ul className="space-y-2">
              {dayEvents.map((event) => {
                const meta = IMPORTANCE_META[event.importance];
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="w-full rounded border border-border bg-panel-2 px-3 py-2.5 text-left transition-colors hover:border-accent/40 hover:bg-panel-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="fs-num inline-flex items-center gap-1 text-2xs text-muted">
                          <Clock3 size={10} />
                          {event.time}
                        </span>
                        <span className={clsx('inline-flex items-center gap-1 text-2xs font-medium', meta.text)}>
                          <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium leading-snug text-fg">{event.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-subtle">
                        <span className="fs-chip h-4 px-1 text-[10px]">{event.category}</span>
                        {event.forecast ? (
                          <span>
                            Forecast <span className="fs-num text-muted">{event.forecast}</span>
                          </span>
                        ) : null}
                        {event.previous ? (
                          <span>
                            Previous <span className="fs-num text-muted">{event.previous}</span>
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-3 border-t border-border pt-2.5 text-2xs leading-relaxed text-subtle">
            Demo events do not reflect any real statistics agency, exchange or central-bank schedule.
          </p>
        </Panel>
      </div>

      <Panel title="Reading the calendar" subtitle="Legend and demo notes">
        <div className="grid gap-3 text-xs text-muted sm:grid-cols-2">
          <ul className="space-y-1.5 leading-relaxed">
            <li>· Grid dots mark event density: one dot per category-symbol pair, coloured by importance.</li>
            <li>· Selecting a date filters the right-hand column to that day only.</li>
            <li>· Category chips filter both the grid and the day list simultaneously.</li>
          </ul>
          <ul className="space-y-1.5 leading-relaxed">
            <li>· Forecast and previous values are fabricated placeholders used for layout testing.</li>
            <li>· Times use a fixed demo clock, so the calendar does not depend on your system date.</li>
            <li>· FinScope is a front-end demo and never claims to publish real economic data.</li>
          </ul>
        </div>
      </Panel>

      <Modal
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        size="md"
        labelledBy="event-dialog-title"
        title={selectedEvent?.title}
        subtitle={
          selectedEvent ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="fs-chip h-5 px-1.5 text-[10px]">{selectedEvent.category}</span>
              <DemoDataBadge className="h-5 px-1.5 text-[10px]" />
              <span>{formatDay(selectedEvent.date)}</span>
              <span aria-hidden>·</span>
              <span className="fs-num">{selectedEvent.time}</span>
            </div>
          ) : null
        }
        footer={
          <button type="button" className="fs-btn h-8" onClick={() => setSelectedEvent(null)}>
            Close
          </button>
        }
      >
        {selectedEvent ? (
          <div className="space-y-3">
            <p className="flex items-start gap-2 rounded border border-warn/25 bg-warn/10 px-3 py-2 text-2xs leading-relaxed text-warn">
              <Info size={12} className="mt-0.5 shrink-0" />
              Synthetic event. Figures, forecasts and descriptions are fabricated for demonstration.
            </p>

            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-border bg-panel-2 px-3 py-2">
                <dt className="text-2xs uppercase tracking-[0.12em] text-subtle">Importance</dt>
                <dd className={clsx('mt-0.5 text-sm font-semibold', IMPORTANCE_META[selectedEvent.importance].text)}>
                  {IMPORTANCE_META[selectedEvent.importance].label}
                </dd>
              </div>
              <div className="rounded border border-border bg-panel-2 px-3 py-2">
                <dt className="text-2xs uppercase tracking-[0.12em] text-subtle">Release time</dt>
                <dd className="fs-num mt-0.5 text-sm font-semibold text-fg">{selectedEvent.time}</dd>
              </div>
              <div className="rounded border border-border bg-panel-2 px-3 py-2">
                <dt className="text-2xs uppercase tracking-[0.12em] text-subtle">Previous</dt>
                <dd className="fs-num mt-0.5 text-sm text-fg">{selectedEvent.previous ?? '—'}</dd>
              </div>
              <div className="rounded border border-border bg-panel-2 px-3 py-2">
                <dt className="text-2xs uppercase tracking-[0.12em] text-subtle">Forecast</dt>
                <dd className="fs-num mt-0.5 text-sm text-fg">{selectedEvent.forecast ?? '—'}</dd>
              </div>
            </dl>

            <p className="text-xs leading-relaxed text-muted">{selectedEvent.description}</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
