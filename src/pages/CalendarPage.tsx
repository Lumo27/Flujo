import { useMemo } from 'react';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { MonthCalendar } from '@/features/calendar/MonthCalendar';
import { projectMonth } from '@/lib/calc';

export function CalendarPage() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const startingBalance = useTransactionsStore((s) => s.settings.startingBalance);

  const points = useMemo(
    () => projectMonth(transactions, new Date(), startingBalance),
    [transactions, startingBalance],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Calendario</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Tu mes, día a día</h1>
        <p className="mt-1 text-sm text-muted">
          Cada día muestra tus movimientos y el saldo proyectado al cierre.
        </p>
      </header>

      <MonthCalendar transactions={transactions} projection={points} />
    </div>
  );
}
