import { CalendarClock } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { fromISO } from '@/lib/date';

export function UpcomingList({ items }: { items: Transaction[] }) {
  return (
    <Card>
      <CardHeader
        icon={<CalendarClock size={16} />}
        title="Próximos 14 días"
        subtitle="Lo que viene — pendiente de confirmar"
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={18} />}
          title="Sin movimientos próximos"
          description="Cargá pagos o ingresos futuros para verlos acá."
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {items.slice(0, 7).map((t) => {
            const isIncome = t.type === 'income';
            const daysAway = Math.round(
              (fromISO(t.date).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000,
            );
            const urgency = daysAway <= 2;

            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2"
              >
                {/* Día del mes */}
                <div
                  className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl text-center leading-none ${
                    urgency
                      ? 'bg-[rgba(245,158,11,0.15)] text-warning'
                      : isIncome
                        ? 'bg-income-soft text-income'
                        : 'bg-expense-soft text-expense'
                  }`}
                >
                  <span className="text-base font-bold">
                    {fromISO(t.date).getDate()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{t.title}</p>
                  <p className="text-[11px] text-muted">
                    {daysAway === 0
                      ? 'Hoy'
                      : daysAway === 1
                        ? 'Mañana'
                        : `En ${daysAway} días`}
                    {' · '}
                    {formatDateShort(t.date)}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    isIncome ? 'text-income' : 'text-expense'
                  }`}
                >
                  {isIncome ? '+' : '−'}
                  {formatCurrency(t.estimatedAmount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
