import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, isSameMonth, isToday } from 'date-fns';
import { Transaction } from '@/types/transaction';
import { calendarGrid, monthLabel, toISO } from '@/lib/date';
import { cn } from '@/lib/cn';
import { formatCompact, formatCurrency, formatDateLong } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { ProjectionPoint } from '@/lib/calc';
import { TransactionList } from '@/features/transactions/TransactionList';

interface Props {
  transactions: Transaction[];
  projection: ProjectionPoint[];
}

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function MonthCalendar({ transactions, projection }: Props) {
  const [ref, setRef] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(toISO(new Date()));

  const days = useMemo(() => calendarGrid(ref), [ref]);
  const projByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projection) m.set(p.date, p.estimated);
    return m;
  }, [projection]);

  const byDate = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const t of transactions) {
      if (!m.has(t.date)) m.set(t.date, []);
      m.get(t.date)!.push(t);
    }
    return m;
  }, [transactions]);

  const selectedItems = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:gap-6">
      <Card className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setRef(addMonths(ref, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-sm font-semibold capitalize sm:text-base">{monthLabel(ref)}</h2>
          <button
            onClick={() => setRef(addMonths(ref, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted">
          {weekDays.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const iso = toISO(d);
            const inMonth = isSameMonth(d, ref);
            const items = byDate.get(iso) ?? [];
            const hasIncome = items.some((x) => x.type === 'income');
            const hasExpense = items.some((x) => x.type === 'expense');
            const hasPending = items.some((x) => x.status === 'pending');
            const proj = projByDate.get(iso);
            const isSel = selected === iso;

            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={cn(
                  'relative flex aspect-square flex-col items-start justify-between rounded-lg p-1.5 text-left transition-colors sm:p-2',
                  'border',
                  isSel
                    ? 'border-primary bg-primary-soft'
                    : 'border-transparent hover:border-border hover:bg-surface-2',
                  !inMonth && 'opacity-35',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-semibold sm:text-xs',
                    isToday(d) && 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white',
                  )}
                >
                  {d.getDate()}
                </span>
                {items.length > 0 && (
                  <div className="flex gap-0.5">
                    {hasIncome && <span className="h-1.5 w-1.5 rounded-full bg-income" />}
                    {hasExpense && <span className="h-1.5 w-1.5 rounded-full bg-expense" />}
                    {hasPending && <span className="h-1.5 w-1.5 rounded-full bg-warning" />}
                  </div>
                )}
                {proj != null && inMonth && (
                  <span className="hidden text-[10px] text-muted sm:block">
                    {formatCompact(proj)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
          <Legend color="bg-income" label="Ingreso" />
          <Legend color="bg-expense" label="Gasto" />
          <Legend color="bg-warning" label="Pendiente" />
        </div>
      </Card>

      <Card>
        <div className="mb-3">
          <p className="text-xs font-medium text-muted">Día seleccionado</p>
          <h3 className="text-base font-semibold capitalize">
            {selected ? formatDateLong(selected) : '—'}
          </h3>
          {selected && projByDate.get(selected) != null && (
            <p className="mt-1 text-xs text-muted">
              Saldo proyectado: {formatCurrency(projByDate.get(selected)!)}
            </p>
          )}
        </div>
        <TransactionList
          transactions={selectedItems}
          emptyTitle="Sin movimientos en este día"
          emptyDescription="Tocá otro día o cargá un movimiento nuevo."
        />
      </Card>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
