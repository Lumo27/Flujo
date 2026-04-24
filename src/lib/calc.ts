import { Transaction } from '@/types/transaction';
import { isInMonth, toISO } from './date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectionSettings {
  /** Total income you expect to earn this month — your normal scenario. */
  estimatedMonthlyIncome: number;
  /** Total income in the worst case — if everything goes wrong. */
  worstMonthlyIncome: number;
  /**
   * ISO dates of the days you plan to work this month.
   * The monthly totals are divided equally across these days to build
   * the Est / Piso step-function lines in the chart.
   */
  workDays: string[];
}

export const DEFAULT_PROJECTION_SETTINGS: ProjectionSettings = {
  estimatedMonthlyIncome: 0,
  worstMonthlyIncome: 0,
  workDays: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confirmedDelta(t: Transaction): number {
  if (t.status !== 'confirmed') return 0;
  const amount = t.actualAmount ?? t.estimatedAmount;
  return t.type === 'income' ? amount : -amount;
}

// ─── Public calculations ──────────────────────────────────────────────────────

export function realizedDelta(t: Transaction): number {
  return confirmedDelta(t);
}

export function currentBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + confirmedDelta(t), 0);
}

export interface MonthSummary {
  incomeConfirmed: number;
  incomeEstimated: number;
  expenseConfirmed: number;
  expenseEstimated: number;
}

export function monthSummary(transactions: Transaction[], ref: Date): MonthSummary {
  let incomeConfirmed = 0;
  let incomeEstimated = 0;
  let expenseConfirmed = 0;
  let expenseEstimated = 0;

  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    const est = t.estimatedAmount;
    const act = t.actualAmount ?? t.estimatedAmount;
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
 * - estimated: cumulative income at the estimated scenario, stepping up on each work day.
 * - worst:     cumulative income at the worst-case scenario, stepping up on each work day.
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
  const hasProjection = n > 0 && (settings.estimatedMonthlyIncome > 0 || settings.worstMonthlyIncome > 0);
  const perDayEst = hasProjection ? settings.estimatedMonthlyIncome / n : 0;
  const perDayWorst = hasProjection ? settings.worstMonthlyIncome / n : 0;

  let runActual = 0;
  let runEst = 0;
  let runWorst = 0;
  const points: IncomePoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(year, month, day));
    const items = byDay[iso] ?? [];

    for (const t of items) {
      if (t.status === 'confirmed') {
        runActual += t.actualAmount ?? t.estimatedAmount;
      }
    }

    if (hasProjection && workDaysThisMonth.includes(iso)) {
      runEst += perDayEst;
      runWorst += perDayWorst;
    }

    points.push({
      date: iso,
      actual: iso <= today ? runActual : null,
      estimated: hasProjection ? Math.round(runEst) : null,
      worst: hasProjection ? Math.round(runWorst) : null,
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
): { actual: number; estimated: number; worst: number } {
  let actual = 0;
  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    if (t.type !== 'income' || t.status !== 'confirmed') continue;
    actual += t.actualAmount ?? t.estimatedAmount;
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
