import { useTransactionsStore } from '@/store/useTransactionsStore';
import { MonthCalendar } from '@/features/calendar/MonthCalendar';

export function CalendarPage() {
  const transactions = useTransactionsStore((s) => s.transactions);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Calendario</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Tu mes, día a día</h1>
        <p className="mt-1 text-sm text-muted">
          Cada día muestra tus movimientos confirmados y pendientes.
        </p>
      </header>

      <MonthCalendar transactions={transactions} />
    </div>
  );
}
