import { Transaction } from '@/types/transaction';
import { fromISO, isInMonth, toISO } from './date';

/** Realised signed amount: positive for income, negative for expense. */
export function realizedDelta(t: Transaction): number {
  if (t.status !== 'confirmed') return 0;
  const amount = t.actualAmount ?? t.estimatedAmount;
  return t.type === 'income' ? amount : -amount;
}

/** Expected signed amount using the estimated figure (regardless of status). */
export function expectedDelta(t: Transaction, mode: 'estimated' | 'worst' = 'estimated'): number {
  const amount =
    mode === 'worst' && t.variability === 'variable' && t.type === 'income'
      ? (t.minAmount ?? 0)
      : t.estimatedAmount;
  return t.type === 'income' ? amount : -amount;
}

/** Effective signed amount: realised if confirmed, otherwise expected. */
export function effectiveDelta(t: Transaction, mode: 'estimated' | 'worst' = 'estimated'): number {
  return t.status === 'confirmed' ? realizedDelta(t) : expectedDelta(t, mode);
}

export function currentBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + realizedDelta(t), 0);
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

export interface ProjectionPoint {
  date: string;
  estimated: number;
  worst: number;
}

/**
 * Running projected balance per day from month start to month end.
 * `estimated` uses each transaction's best guess; `worst` uses minAmount
 * for variable incomes (conservative floor).
 */
export function projectMonth(
  transactions: Transaction[],
  ref: Date,
  startingBalance: number,
): ProjectionPoint[] {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    (byDay[t.date] ||= []).push(t);
  }

  let runEst = startingBalance;
  let runWorst = startingBalance;
  const points: ProjectionPoint[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(year, month, day));
    const items = byDay[iso] ?? [];
    for (const t of items) {
      runEst += effectiveDelta(t, 'estimated');
      runWorst += effectiveDelta(t, 'worst');
    }
    points.push({ date: iso, estimated: runEst, worst: runWorst });
  }
  return points;
}

export interface MinBalancePoint {
  date: string;
  amount: number;
}

export function worstCaseFloor(points: ProjectionPoint[]): MinBalancePoint | null {
  if (points.length === 0) return null;
  let min = points[0];
  for (const p of points) if (p.worst < min.worst) min = p;
  return { date: min.date, amount: min.worst };
}

export function endOfMonthProjection(points: ProjectionPoint[]): { estimated: number; worst: number } {
  if (points.length === 0) return { estimated: 0, worst: 0 };
  const last = points[points.length - 1];
  return { estimated: last.estimated, worst: last.worst };
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
