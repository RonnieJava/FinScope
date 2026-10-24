import clsx from 'clsx';
import { addDays, monthLabel, startOfUTCMonth, toISODate } from '@/utils/date';
import type { EconomicEvent } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = '2026-10-23';

const IMPORTANCE_DOT: Record<EconomicEvent['importance'], string> = {
  high: 'bg-warn',
  medium: 'bg-accent',
  low: 'bg-subtle',
};

interface CalendarGridProps {
  month: Date;
  events: EconomicEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({ month, events, selectedDate, onSelectDate }: CalendarGridProps) {
  const first = startOfUTCMonth(month);
  const offset = first.getUTCDay();
  const start = addDays(first, -offset);

  const byDate = new Map<string, EconomicEvent[]>();
  for (const event of events) {
    const list = byDate.get(event.date);
    if (list) list.push(event);
    else byDate.set(event.date, [event]);
  }

  const cells = Array.from({ length: 42 }, (_, index) => addDays(start, index));

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-1 py-2 text-center text-2xs font-medium uppercase tracking-[0.1em] text-muted">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7" role="grid" aria-label={`${monthLabel(month)} events`}>
        {cells.map((date) => {
          const iso = toISODate(date);
          const inMonth = date.getUTCMonth() === first.getUTCMonth();
          const dayEvents = byDate.get(iso) ?? [];
          const selected = iso === selectedDate;
          const isToday = iso === TODAY;

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-selected={selected}
              aria-label={`${iso}, ${dayEvents.length} demo events`}
              onClick={() => onSelectDate(iso)}
              className={clsx(
                'relative flex min-h-[76px] flex-col items-start gap-1 border-b border-r border-border/70 p-1.5 text-left transition-colors last:border-r-0 sm:min-h-[92px] sm:p-2',
                inMonth ? 'bg-transparent hover:bg-panel-2/70' : 'bg-panel-2/20 hover:bg-panel-2/40',
                selected && 'bg-accent-soft',
              )}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <span
                  className={clsx(
                    'fs-num flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-2xs font-semibold',
                    !inMonth && 'text-subtle',
                    inMonth && !isToday && !selected && 'text-fg',
                    isToday && 'bg-warn/15 text-warn',
                    selected && !isToday && 'bg-accent text-white',
                  )}
                >
                  {date.getUTCDate()}
                </span>
                {dayEvents.length > 0 ? (
                  <span className="hidden text-2xs text-subtle sm:inline">{dayEvents.length}</span>
                ) : null}
              </span>

              <span className="hidden w-full space-y-1 sm:block">
                {dayEvents.slice(0, 2).map((event) => (
                  <span
                    key={event.id}
                    className={clsx(
                      'block truncate rounded px-1 py-0.5 text-[10px] leading-3',
                      event.importance === 'high'
                        ? 'bg-warn/10 text-warn'
                        : 'bg-panel-3 text-muted',
                    )}
                  >
                    {event.time.replace(' ET', '')} {event.title}
                  </span>
                ))}
                {dayEvents.length > 2 ? (
                  <span className="block text-[10px] text-subtle">+{dayEvents.length - 2} more</span>
                ) : null}
              </span>

              <span className="flex w-full flex-wrap gap-1 sm:hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={clsx('h-1.5 w-1.5 rounded-full', IMPORTANCE_DOT[event.importance])}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
