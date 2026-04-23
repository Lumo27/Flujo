import { Transaction } from '@/types/transaction';
import { toISO } from '@/lib/date';

/**
 * Realistic starter data that tells the product's story:
 * a weekend worker with a fixed daily wage and a variable tip,
 * plus the usual monthly bills coming up.
 *
 * Generated relative to today so the calendar and dashboard always
 * feel "alive" on first load.
 */
export function buildSeed(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const day = (n: number) => toISO(new Date(year, month, n));
  const ts = new Date().toISOString();
  let i = 0;
  const mk = (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => ({
    ...t,
    id: `seed_${++i}`,
    createdAt: ts,
    updatedAt: ts,
  });

  const past = (n: number) => Math.max(1, today - n);
  const future = (n: number) => Math.min(28, today + n);

  return [
    // Confirmed weekend work already done this month
    mk({
      type: 'income',
      status: 'confirmed',
      variability: 'fixed',
      category: 'salary',
      title: 'Turno sábado',
      date: day(past(13)),
      estimatedAmount: 45000,
      actualAmount: 45000,
    }),
    mk({
      type: 'income',
      status: 'confirmed',
      variability: 'variable',
      category: 'tips',
      title: 'Propinas sábado',
      date: day(past(13)),
      estimatedAmount: 100000,
      minAmount: 60000,
      actualAmount: 118000,
    }),
    mk({
      type: 'income',
      status: 'confirmed',
      variability: 'fixed',
      category: 'salary',
      title: 'Turno domingo',
      date: day(past(12)),
      estimatedAmount: 45000,
      actualAmount: 45000,
    }),
    mk({
      type: 'income',
      status: 'confirmed',
      variability: 'variable',
      category: 'tips',
      title: 'Propinas domingo',
      date: day(past(12)),
      estimatedAmount: 100000,
      minAmount: 60000,
      actualAmount: 82000,
    }),

    // Recent real-life expenses
    mk({
      type: 'expense',
      status: 'confirmed',
      variability: 'variable',
      category: 'groceries',
      title: 'Supermercado semanal',
      date: day(past(10)),
      estimatedAmount: 55000,
      actualAmount: 61200,
    }),
    mk({
      type: 'expense',
      status: 'confirmed',
      variability: 'fixed',
      category: 'subscriptions',
      title: 'Spotify',
      date: day(past(6)),
      estimatedAmount: 2990,
      actualAmount: 2990,
    }),
    mk({
      type: 'expense',
      status: 'confirmed',
      variability: 'variable',
      category: 'transport',
      title: 'SUBE + combustible',
      date: day(past(3)),
      estimatedAmount: 18000,
      actualAmount: 21500,
    }),

    // Upcoming weekend (pending)
    mk({
      type: 'income',
      status: 'pending',
      variability: 'fixed',
      category: 'salary',
      title: 'Turno sábado',
      date: day(future(2)),
      estimatedAmount: 45000,
    }),
    mk({
      type: 'income',
      status: 'pending',
      variability: 'variable',
      category: 'tips',
      title: 'Propinas sábado',
      note: 'Estimación histórica ~100k, piso conservador 60k',
      date: day(future(2)),
      estimatedAmount: 100000,
      minAmount: 60000,
    }),
    mk({
      type: 'income',
      status: 'pending',
      variability: 'fixed',
      category: 'salary',
      title: 'Turno domingo',
      date: day(future(3)),
      estimatedAmount: 45000,
    }),
    mk({
      type: 'income',
      status: 'pending',
      variability: 'variable',
      category: 'tips',
      title: 'Propinas domingo',
      date: day(future(3)),
      estimatedAmount: 100000,
      minAmount: 60000,
    }),

    // Upcoming fixed bills
    mk({
      type: 'expense',
      status: 'pending',
      variability: 'fixed',
      category: 'rent',
      title: 'Alquiler',
      date: day(Math.min(28, 5 > today ? 5 : future(7))),
      estimatedAmount: 320000,
    }),
    mk({
      type: 'expense',
      status: 'pending',
      variability: 'fixed',
      category: 'utilities',
      title: 'Luz',
      date: day(future(5)),
      estimatedAmount: 28000,
    }),
    mk({
      type: 'expense',
      status: 'pending',
      variability: 'fixed',
      category: 'utilities',
      title: 'Internet',
      date: day(future(9)),
      estimatedAmount: 22000,
    }),
    mk({
      type: 'expense',
      status: 'pending',
      variability: 'variable',
      category: 'groceries',
      title: 'Supermercado (próxima semana)',
      date: day(future(6)),
      estimatedAmount: 55000,
    }),
  ];
}
