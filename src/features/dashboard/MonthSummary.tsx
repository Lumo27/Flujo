import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { MonthSummary as Summary } from '@/lib/calc';

export function MonthSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Tile
        tone="income"
        label="Ingresos del mes"
        confirmed={summary.incomeConfirmed}
        estimated={summary.incomeEstimated}
      />
      <Tile
        tone="expense"
        label="Gastos del mes"
        confirmed={summary.expenseConfirmed}
        estimated={summary.expenseEstimated}
      />
    </div>
  );
}

function Tile({
  tone,
  label,
  confirmed,
  estimated,
}: {
  tone: 'income' | 'expense';
  label: string;
  confirmed: number;
  estimated: number;
}) {
  const isIncome = tone === 'income';
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
            isIncome ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense'
          }`}
        >
          {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
        </span>
        {label}
      </div>
      <p className={`mt-3 text-2xl font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
        {formatCurrency(confirmed)}
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Proyectado del mes {formatCurrency(estimated)}
      </p>
    </div>
  );
}
