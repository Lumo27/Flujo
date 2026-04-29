import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, X, CheckSquare } from 'lucide-react';
import { addMonths, isSameMonth, isToday } from 'date-fns';
import { Transaction } from '@/types/transaction';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { calendarGrid, monthLabel, toISO } from '@/lib/date';
import { cn } from '@/lib/cn';
import { formatDateLong } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TransactionList } from '@/features/transactions/TransactionList';

interface Props {
  transactions: Transaction[];
}

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function MonthCalendar({ transactions }: Props) {
  const removeTransaction = useTransactionsStore((s) => s.removeTransaction);

  const [ref, setRef] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(toISO(new Date()));

  // Multi-delete state
  const [deleteMode, setDeleteMode] = useState(false);
  const [toDelete, setToDelete] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const days = useMemo(() => calendarGrid(ref), [ref]);

  const byDate = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const t of transactions) {
      if (!m.has(t.date)) m.set(t.date, []);
      m.get(t.date)!.push(t);
    }
    return m;
  }, [transactions]);

  const selectedItems = selected && !deleteMode ? (byDate.get(selected) ?? []) : [];

  function toggleDeleteDay(iso: string) {
    if (!byDate.has(iso)) return; // only days with transactions
    setToDelete((prev) => {
      const next = new Set(prev);
      next.has(iso) ? next.delete(iso) : next.add(iso);
      return next;
    });
  }

  function exitDeleteMode() {
    setDeleteMode(false);
    setToDelete(new Set());
  }

  function handleConfirmDelete() {
    const ids = [...toDelete].flatMap((iso) => (byDate.get(iso) ?? []).map((t) => t.id));
    ids.forEach((id) => removeTransaction(id));
    setConfirmOpen(false);
    exitDeleteMode();
  }

  const toDeleteCount = [...toDelete].reduce((sum, iso) => sum + (byDate.get(iso)?.length ?? 0), 0);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:gap-6">
        <Card className="p-3 sm:p-4">
          {/* Header: nav + delete mode toggle */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => !deleteMode && setRef(addMonths(ref, -1))}
              disabled={deleteMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text disabled:opacity-30"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-sm font-semibold sm:text-base">{monthLabel(ref)}</h2>
            <button
              onClick={() => !deleteMode && setRef(addMonths(ref, 1))}
              disabled={deleteMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text disabled:opacity-30"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Delete mode toolbar */}
          {deleteMode ? (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-expense/30 bg-expense-soft px-3 py-2">
              <span className="text-xs font-medium text-expense">
                {toDelete.size === 0
                  ? 'Tocá los días a eliminar'
                  : `${toDelete.size} día${toDelete.size !== 1 ? 's' : ''} · ${toDeleteCount} movimiento${toDeleteCount !== 1 ? 's' : ''}`}
              </span>
              <div className="flex items-center gap-2">
                {toDelete.size > 0 && (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-expense px-2.5 py-1 text-xs font-medium text-white"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                )}
                <button
                  onClick={exitDeleteMode}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-expense hover:bg-expense/20"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setDeleteMode(true); setSelected(null); }}
              className="mb-3 flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-expense"
            >
              <CheckSquare size={12} /> Selección múltiple
            </button>
          )}

          <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium text-muted">
            {weekDays.map((d, i) => <div key={i}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => {
              const iso = toISO(d);
              const inMonth = isSameMonth(d, ref);
              const items = byDate.get(iso) ?? [];
              const hasIncome = items.some((x) => x.type === 'income');
              const hasExpense = items.some((x) => x.type === 'expense');
              const hasPending = items.some((x) => x.status === 'pending');
              const hasItems = items.length > 0;

              const isSel = !deleteMode && selected === iso;
              const isMarkedForDelete = deleteMode && toDelete.has(iso);
              const isSelectableForDelete = deleteMode && hasItems;

              return (
                <button
                  key={iso}
                  onClick={() => {
                    if (!inMonth) return;
                    if (deleteMode) {
                      toggleDeleteDay(iso);
                    } else {
                      setSelected(iso);
                    }
                  }}
                  className={cn(
                    'relative flex aspect-square flex-col items-start justify-between rounded-lg p-1.5 text-left transition-colors sm:p-2',
                    'border',
                    !inMonth && 'opacity-25 pointer-events-none',
                    // Normal mode
                    !deleteMode && isSel && 'border-primary bg-primary-soft',
                    !deleteMode && !isSel && 'border-border/50 bg-surface-2/30 hover:border-border hover:bg-surface-2',
                    // Delete mode
                    deleteMode && isMarkedForDelete && 'border-expense bg-expense-soft',
                    deleteMode && !isMarkedForDelete && isSelectableForDelete && 'border-border/50 bg-surface-2/30 hover:border-expense/40 hover:bg-expense-soft/30',
                    deleteMode && !isSelectableForDelete && inMonth && 'border-border/20 opacity-40 cursor-default',
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-semibold sm:text-xs',
                      isToday(d) && !deleteMode && 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white',
                      isMarkedForDelete && 'text-expense',
                    )}
                  >
                    {d.getDate()}
                  </span>
                  {hasItems && (
                    <div className="flex gap-0.5">
                      {hasIncome && <span className="h-1.5 w-1.5 rounded-full bg-income" />}
                      {hasExpense && <span className="h-1.5 w-1.5 rounded-full bg-expense" />}
                      {hasPending && <span className="h-1.5 w-1.5 rounded-full bg-warning" />}
                    </div>
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
            <h3 className="text-base font-semibold">
              {selected && !deleteMode ? formatDateLong(selected) : '—'}
            </h3>
          </div>
          {deleteMode ? (
            <p className="text-sm text-muted">
              Tocá los días en el calendario para marcarlos y luego eliminá todos sus movimientos de una vez.
            </p>
          ) : (
            <TransactionList
              transactions={selectedItems}
              emptyTitle="Sin movimientos en este día"
              emptyDescription="Tocá otro día o cargá un movimiento nuevo."
            />
          )}
        </Card>
      </div>

      {/* Confirm delete modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Eliminar movimientos">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Vas a eliminar{' '}
            <span className="font-medium text-expense">
              {toDeleteCount} movimiento{toDeleteCount !== 1 ? 's' : ''}
            </span>{' '}
            de{' '}
            <span className="font-medium text-text">
              {toDelete.size} día{toDelete.size !== 1 ? 's' : ''}
            </span>
            . Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-expense text-white shadow-none hover:bg-expense/90"
            >
              Eliminar todo
            </Button>
          </div>
        </div>
      </Modal>
    </>
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
