import { Transaction } from '@/types/transaction';
import { isInMonth, toISO } from './date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectionSettings {
  /** Total income you want to earn this month — your goal. */
  estimatedMonthlyIncome: number;
  /** Total income in the worst case — floor scenario. */
  worstMonthlyIncome: number;
  /**
   * How much you earn per shift/work day.
   * Gets assigned to each selected work day to build the "Estimación"
   * step-function line in the chart.
   * Falls back to estimatedMonthlyIncome ÷ workDays when not set.
   */
  shiftIncome: number;
  /**
   * ISO dates of the days you plan to work this month.
   */
  workDays: string[];
}

export const DEFAULT_PROJECTION_SETTINGS: ProjectionSettings = {
  estimatedMonthlyIncome: 0,
  worstMonthlyIncome: 0,
  shiftIncome: 0,
  workDays: [],
};

/**
 * Returns true if the projection settings have enough data to draw chart lines
 * for a given reference month. Single source of truth — used by both calc.ts
 * internals and DashboardPage.
 */
export function hasProjectionSettings(settings: ProjectionSettings, ref: Date): boolean {
  const workDaysThisMonth = settings.workDays.filter((d) => isInMonth(d, ref));
  return (
    workDaysThisMonth.length > 0 &&
    (settings.estimatedMonthlyIncome > 0 ||
      settings.worstMonthlyIncome > 0 ||
      settings.shiftIncome > 0)
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a transaction amount to ARS using the blue rate. */
function toARS(amount: number, t: Transaction, blueRate: number): number {
  return t.currency === 'USD' ? amount * blueRate : amount;
}

function confirmedDelta(t: Transaction, blueRate: number): number {
  if (t.status !== 'confirmed') return 0;
  const amount = toARS(t.actualAmount ?? t.estimatedAmount, t, blueRate);
  return t.type === 'income' ? amount : -amount;
}

// ─── Public calculations ──────────────────────────────────────────────────────

export function realizedDelta(t: Transaction, blueRate = 1): number {
  return confirmedDelta(t, blueRate);
}

export function currentBalance(transactions: Transaction[], blueRate = 1): number {
  return transactions.reduce((sum, t) => sum + confirmedDelta(t, blueRate), 0);
}

export interface MonthSummary {
  incomeConfirmed: number;
  incomeEstimated: number;
  expenseConfirmed: number;
  expenseEstimated: number;
}

export function monthSummary(transactions: Transaction[], ref: Date, blueRate = 1): MonthSummary {
  let incomeConfirmed = 0;
  let incomeEstimated = 0;
  let expenseConfirmed = 0;
  let expenseEstimated = 0;

  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    const est = toARS(t.estimatedAmount, t, blueRate);
    const act = toARS(t.actualAmount ?? t.estimatedAmount, t, blueRate);
    if (t.type === 'income') {
      incomeEstimated += est;
      if (t.status === 'confirmed') incomeConfirmed += act;
    } else {
      expenseEstimated += est;
      if (t.status === 'confirmed') expenseConfirmed += act;
    }
  }
  return { incomeConfirmed, incomeEstimated, expenseConfirmed, expenseEstimated };
}

/**
 * Three-line projection for the chart:
 *
 * - actual:    cumulative confirmed income. Null for future dates (line stops at today).
 * - estimated: steps up by shiftIncome on each work day (or estimatedMonthlyIncome/n fallback).
 * - worst:     steps up by worstMonthlyIncome/n on each work day.
 *
 * Est / Piso are null for all days if no work days are configured.
 */
export interface IncomePoint {
  date: string;
  actual: number | null;
  estimated: number | null;
  worst: number | null;
}

export function projectIncomeByDay(
  transactions: Transaction[],
  ref: Date,
  settings: ProjectionSettings,
  blueRate = 1,
): IncomePoint[] {
  const today = toISO(new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Confirmed income by day
  const byDay: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    if (t.type !== 'income') continue;
    (byDay[t.date] ||= []).push(t);
  }

  // Work days for this specific month
  const workDaysThisMonth = settings.workDays
    .filter((d) => isInMonth(d, ref))
    .sort();

  const n = workDaysThisMonth.length;
  const hasProjection = hasProjectionSettings(settings, ref);

  // Estimated step: use shiftIncome if set, otherwise divide monthly goal by days
  const perDayEst = hasProjection
    ? settings.shiftIncome > 0
      ? settings.shiftIncome
      : settings.estimatedMonthlyIncome / n
    : 0;

  // Worst step: divide monthly worst by days
  const perDayWorst = hasProjection && settings.worstMonthlyIncome > 0
    ? settings.worstMonthlyIncome / n
    : 0;

  const hasWorst = hasProjection && perDayWorst > 0;

  let runActual = 0;
  let runEst = 0;
  let runWorst = 0;
  const points: IncomePoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(year, month, day));
    const items = byDay[iso] ?? [];

    for (const t of items) {
      if (t.status === 'confirmed') {
        runActual += toARS(t.actualAmount ?? t.estimatedAmount, t, blueRate);
      }
    }

    if (hasProjection && workDaysThisMonth.includes(iso)) {
      runEst += perDayEst;
      if (hasWorst) runWorst += perDayWorst;
    }

    points.push({
      date: iso,
      actual: iso <= today ? runActual : null,
      estimated: hasProjection ? Math.round(runEst) : null,
      worst: hasWorst ? Math.round(runWorst) : null,
    });
  }

  return points;
}

/**
 * Income totals for the month across 3 scenarios (for the summary cards).
 * actual = confirmed income so far.
 * estimated / worst = the configured monthly targets.
 */
export function monthIncomeProjection(
  transactions: Transaction[],
  ref: Date,
  settings: ProjectionSettings,
  blueRate = 1,
): { actual: number; estimated: number; worst: number } {
  let actual = 0;
  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    if (t.type !== 'income' || t.status !== 'confirmed') continue;
    actual += toARS(t.actualAmount ?? t.estimatedAmount, t, blueRate);
  }
  return {
    actual,
    estimated: settings.estimatedMonthlyIncome,
    worst: settings.worstMonthlyIncome,
  };
}

export function upcoming(transactions: Transaction[], days = 14): Transaction[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + days);
  return transactions
    .filter((t) => t.status === 'pending')
    .filter((t) => {
      const d = new Date(t.date + 'T00:00:00');
      return d >= now && d <= horizon;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
