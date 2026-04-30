import { Transaction } from '@/types/transaction';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';
import { formatDateLong } from '@/lib/format';

interface Props {
  transactions: Transaction[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TransactionList({
  transactions,
  emptyTitle = 'Sin movimientos',
  emptyDescription = 'Cargá tu primer movimiento para empezar a ver tu flujo.',
}: Props) {
  if (transactions.length === 0) {
    return <EmptyState icon={<Inbox size={20} />} title={emptyTitle} description={emptyDescription} />;
  }

  const grouped = groupByDate(transactions);
  return (
    <div className="flex flex-col gap-4">
      {grouped.map(([date, items]) => (
        <div key={date}>
          <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wider text-muted/80">
            {date}
          </p>
          <div className="flex flex-col">
            {items.map((t) => (
              <TransactionItem key={t.id} t={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(transactions: Transaction[]): Array<[string, Transaction[]]> {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, Transaction[]>();
  for (const t of sorted) {
    // Use formatDateLong for consistent sentence-case across all browsers
    const key = formatDateLong(t.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries());
}
