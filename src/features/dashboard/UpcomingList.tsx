import { CalendarClock } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateShort } from '@/lib/format';

export function UpcomingList({ items }: { items: Transaction[] }) {
  return (
    <Card>
      <CardHeader
        icon={<CalendarClock size={16} />}
        title="Próximos 14 días"
        subtitle="Ingresos y pagos pendientes"
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={18} />}
          title="Sin movimientos próximos"
          description="Cargá pagos o ingresos futuros para verlos acá."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border/70">
          {items.slice(0, 6).map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold ${
                  t.type === 'income' ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense'
                }`}
              >
                {formatDateShort(t.date).split(' ')[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted">{formatDateShort(t.date)}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  t.type === 'income' ? 'text-income' : 'text-expense'
                }`}
              >
                {t.type === 'income' ? '+' : '−'}
                {formatCurrency(t.estimatedAmount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
