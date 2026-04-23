import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { MonthSummary as Summary } from '@/lib/calc';

export function MonthSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Tile
        tone="income"
        label="Entró este mes"
        confirmed={summary.incomeConfirmed}
        estimated={summary.incomeEstimated}
      />
      <Tile
        tone="expense"
        label="Salió este mes"
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
  const pct = estimated > 0 ? Math.min(100, Math.round((confirmed / estimated) * 100)) : 0;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            isIncome ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense'
          }`}
        >
          {isIncome ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
        </span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>

      <p className={`mt-3 text-2xl font-semibold sm:text-3xl ${isIncome ? 'text-income' : 'text-expense'}`}>
        {formatCurrency(confirmed)}
      </p>

      {/* Progress bar: confirmado vs estimado */}
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted">
          <span>del mes</span>
          <span className="font-medium">{formatCurrency(estimated)}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all ${isIncome ? 'bg-income' : 'bg-expense'}`}
            style={{ width: `${pct}%`, opacity: 0.7 }}
          />
        </div>
      </div>
    </div>
  );
}
