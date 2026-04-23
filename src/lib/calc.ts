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
 * Signed delta for a projected line (Estimación or Piso).
 * Applies to ALL transactions regardless of confirmed/pending status —
 * the projection lines always use estimated/worst amounts so they stay
 * visually distinct from Realidad (which uses actual confirmed amounts).
 *
 * - Expenses        → always uses estimatedAmount
 * - Salary category → uses global salaryAmount
 * - Tips category   → uses tipsEstimated or tipsWorst depending on mode
 * - Other income    → uses per-transaction estimatedAmount / minAmount
 */
function projectedDelta(
  t: Transaction,
  mode: 'estimated' | 'worst',
  settings: ProjectionSettings,
): number {
  if (t.type === 'expense') return -t.estimatedAmount;

  // Income — check category for global overrides
  let amount: number;
  if (t.category === 'salary') {
    amount = settings.salaryAmount;
  } else if (t.category === 'tips') {
    amount = mode === 'worst' ? settings.tipsWorst : settings.tipsEstimated;
  } else {
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
 * - actual:    solo transacciones confirmadas con monto real. Null para fechas futuras.
 * - estimated: proyección completa del mes usando montos estimados para TODAS las transacciones.
 * - worst:     proyección completa del mes usando montos mínimos para TODAS las transacciones.
 *
 * Estimación y Piso usan montos proyectados incluso para transacciones confirmadas,
 * de modo que las tres líneas divergen a lo largo de todo el mes:
 *   - Realidad por encima de Estimación → mejores propinas de lo esperado.
 *   - Realidad por debajo de Piso       → peor que el peor escenario, hay que ajustar.
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
      // Realidad: solo confirmadas con monto real
      if (t.status === 'confirmed') {
        runActual += confirmedDelta(t);
      }

      // Estimación y Piso: proyectan TODAS las transacciones del mes
      // con sus montos estimados/mínimos (ignoran si está confirmada o no).
      // Esto hace que las tres líneas sean visualmente distintas en todo el mes.
      runEst += projectedDelta(t, 'estimated', settings);
      runWorst += projectedDelta(t, 'worst', settings);
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

/**
 * Gross income totals for the month — expenses are NOT subtracted.
 *
 * - actual:    sum of confirmed income transactions (real amounts).
 * - estimated: all income transactions at estimated/average params.
 * - worst:     all income transactions at worst-case params.
 *
 * Use this to answer "how much will I earn this month?" in each scenario,
 * letting the user mentally subtract their known fixed expenses.
 */
export function monthIncomeProjection(
  transactions: Transaction[],
  ref: Date,
  settings: ProjectionSettings = DEFAULT_PROJECTION_SETTINGS,
): { actual: number; estimated: number; worst: number } {
  let actual = 0;
  let estimated = 0;
  let worst = 0;

  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    if (t.type !== 'income') continue;

    if (t.status === 'confirmed') {
      actual += t.actualAmount ?? t.estimatedAmount;
    }

    estimated += projectedDelta(t, 'estimated', settings);
    worst += projectedDelta(t, 'worst', settings);
  }

  return { actual, estimated, worst };
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
