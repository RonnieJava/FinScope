/** Single frozen "now" for all demo content. Keeps data stable across reloads. */
export const DEMO_NOW = new Date('2026-10-23T19:42:00Z');
export const DEMO_DATE_LABEL = 'Fri, Oct 23, 2026';
export const DEMO_TIME_LABEL = '15:42 ET';
export const DEMO_UPDATED_AT = '2026-10-23T19:42:00Z';

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/** Generate the last `count` business days ending at (and including) `end`. */
export function businessDaysBack(end: Date, count: number): Date[] {
  const days: Date[] = [];
  let cursor = new Date(end);
  while (days.length < count) {
    if (!isWeekend(cursor)) days.unshift(new Date(cursor));
    cursor = addDays(cursor, -1);
  }
  return days;
}

/** Intraday timestamps for the demo session (09:30–15:42 ET = 14:30–19:42 UTC). */
export function intradayTimestamps(points: number, end: Date): Date[] {
  const endMinutes = 15 * 60 + 42;
  const startMinutes = 9 * 60 + 30;
  const step = (endMinutes - startMinutes) / Math.max(1, points - 1);
  return Array.from({ length: points }, (_, i) => {
    const minute = startMinutes + step * i;
    const stamp = new Date(end);
    stamp.setUTCHours(Math.floor(minute / 60) + 4, Math.round(minute % 60), 0, 0);
    return stamp;
  });
}

export function startOfUTCMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function startOfUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
