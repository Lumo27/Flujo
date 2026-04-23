import { Transaction } from '@/types/transaction';
import { fromISO, isInMonth, toISO } from './date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectionSettings {
  /** Fixed amount earned per salary shift. */
  salaryAmount: number;
  /** Average / normal tips amount. Used for the "Estimación" line. */
  tipsEstimated: number;
  /** Absolute minimum tips. Used for the "Piso" line. */
  tipsWorst: number;
}

export const DEFAULT_PROJECTION_SETTINGS: ProjectionSettings = {
  salaryAmount: 45000,
  tipsEstimated: 100000,
  tipsWorst: 70000,
};

export interface ProjectionPoint {
  date: string;
  /** Only confirmed transactions. Null for future dates (line stops at today). */
  actual: number | null;
  /** Confirmed actual + pending using average income params. Full month. */
  estimated: number;
  /** Confirmed actual + pending using worst-case income params. Full month. */
  worst: number;
}

export interface MinBalancePoint {
  date: string;
  amount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Signed delta of a confirmed transaction using its real amount. */
function confirmedDelta(t: Transaction): number {
  if (t.status !== 'confirmed') return 0;
  const amount = t.actualAmount ?? t.estimatedAmount;
  return t.type === 'income' ? amount : -amount;
}

/**
 * Signed delta for a PENDING transaction.
 * - Salary category → uses global salaryAmount
 * - Tips category   → uses tipsEstimated or tipsWorst depending on mode
 * - Other income    → uses per-transaction estimatedAmount / minAmount
 * - Expenses        → always uses estimatedAmount
 */
function pendingDelta(
  t: Transaction,
  mode: 'estimated' | 'worst',
  settings: ProjectionSettings,
): number {
  if (t.status === 'confirmed') return 0;

  if (t.type === 'expense') return -t.estimatedAmount;

  // Income — check category for global overrides
  let amount: number;
  if (t.category === 'salary') {
    amount = settings.salaryAmount;
  } else if (t.category === 'tips') {
    amount = mode === 'worst' ? settings.tipsWorst : settings.tipsEstimated;
  } else {
    // Other income: use per-transaction values
    amount =
      mode === 'worst' && t.variability === 'variable' && t.minAmount != null
        ? t.minAmount
        : t.estimatedAmount;
  }
  return amount;
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
 * Three-line projection for the month:
 * - actual:    only confirmed transactions, null for future dates
 * - estimated: confirmed actual + pending at average income params
 * - worst:     confirmed actual + pending at worst-case income params
 */
export function projectMonth(
  transactions: Transaction[],
  ref: Date,
  startingBalance: number,
  settings: ProjectionSettings = DEFAULT_PROJECTION_SETTINGS,
): ProjectionPoint[] {
  const today = toISO(new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    (byDay[t.date] ||= []).push(t);
  }

  let runActual = startingBalance;
  let runEst = startingBalance;
  let runWorst = startingBalance;
  const points: ProjectionPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(year, month, day));
    const items = byDay[iso] ?? [];

    for (const t of items) {
      const conf = confirmedDelta(t);
      const est = pendingDelta(t, 'estimated', settings);
      const worst = pendingDelta(t, 'worst', settings);

      // Confirmed counts for all three lines
      if (t.status === 'confirmed') {
        runActual += conf;
        runEst += conf;
        runWorst += conf;
      } else {
        // Pending: only affects estimated & worst lines
        runEst += est;
        runWorst += worst;
      }
    }

    points.push({
      date: iso,
      actual: iso <= today ? runActual : null,
      estimated: runEst,
      worst: runWorst,
    });
  }

  return points;
}

export function worstCaseFloor(points: ProjectionPoint[]): MinBalancePoint | null {
  if (points.length === 0) return null;
  let min = points[0];
  for (const p of points) if (p.worst < min.worst) min = p;
  return { date: min.date, amount: min.worst };
}

export function endOfMonthProjection(points: ProjectionPoint[]): {
  actual: number | null;
  estimated: number;
  worst: number;
} {
  if (points.length === 0) return { actual: null, estimated: 0, worst: 0 };
  const last = points[points.length - 1];
  // Last non-null actual
  const lastActual = [...points].reverse().find((p) => p.actual !== null)?.actual ?? null;
  return { actual: lastActual, estimated: last.estimated, worst: last.worst };
}

export function upcoming(transactions: Transaction[], days = 14): Transaction[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + days);
  return transactions
    .filter((t) => t.status === 'pending')
    .filter((t) => {
      const d = fromISO(t.date);
      return d >= now && d <= horizon;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
