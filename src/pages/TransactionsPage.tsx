import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { TransactionList } from '@/features/transactions/TransactionList';
import { FilterValue, TypeFilter } from '@/features/transactions/TypeFilter';
import { Button } from '@/components/ui/Button';
import { TransactionFormModal } from '@/features/transactions/TransactionFormModal';

export function TransactionsPage() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'income':
        return transactions.filter((t) => t.type === 'income');
      case 'expense':
        return transactions.filter((t) => t.type === 'expense');
      case 'pending':
        return transactions.filter((t) => t.status === 'pending');
      default:
        return transactions;
    }
  }, [transactions, filter]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Movimientos</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Todos tus movimientos</h1>
          <p className="mt-1 text-sm text-muted">Confirmá pendientes con su monto real cuando ocurran.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="hidden sm:inline-flex">
          <Plus size={16} /> Nuevo
        </Button>
      </header>

      <TypeFilter value={filter} onChange={setFilter} />

      <TransactionList
        transactions={filtered}
        emptyTitle={filter === 'all' ? 'Sin movimientos aún' : 'No hay resultados para este filtro'}
        emptyDescription={
          filter === 'all'
            ? 'Cargá tu primer ingreso o gasto para empezar.'
            : 'Probá otro filtro o cargá un movimiento nuevo.'
        }
      />

      <TransactionFormModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
