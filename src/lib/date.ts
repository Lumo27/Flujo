import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export const ISO = 'yyyy-MM-dd';

export function toISO(date: Date): string {
  return format(date, ISO);
}

export function fromISO(iso: string): Date {
  return parseISO(iso);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function monthRange(ref: Date): { start: Date; end: Date } {
  return { start: startOfMonth(ref), end: endOfMonth(ref) };
}

/** Monday-first calendar grid spanning the month of `ref`. */
export function calendarGrid(ref: Date): Date[] {
  const start = startOfWeek(startOfMonth(ref), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(ref), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function isInMonth(iso: string, ref: Date): boolean {
  return isSameMonth(fromISO(iso), ref);
}

export function isSameDayISO(iso: string, date: Date): boolean {
  return isSameDay(fromISO(iso), date);
}

export function daysFromToday(n: number): string {
  return toISO(addDays(new Date(), n));
}

export function monthLabel(ref: Date): string {
  const raw = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(ref);
  // Capitalize only the first letter — CSS `capitalize` would uppercase every word (e.g. "De")
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}
