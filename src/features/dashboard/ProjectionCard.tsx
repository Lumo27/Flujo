import { TrendingUp, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { MinBalancePoint, ProjectionPoint, endOfMonthProjection, worstCaseFloor } from '@/lib/calc';

export function ProjectionCard({ points }: { points: ProjectionPoint[] }) {
  const eom = endOfMonthProjection(points);
  const floor = worstCaseFloor(points);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <Block
        icon={<TrendingUp size={14} />}
        title="Proyección a fin de mes"
        value={eom.estimated}
        hint={`Peor escenario: ${formatCurrency(eom.worst)}`}
        accent="primary"
      />
      <Block
        icon={<ShieldAlert size={14} />}
        title="Piso proyectado"
        value={floor?.amount ?? 0}
        hint={floor ? `Punto más bajo: ${formatDateLong(floor.date)}` : 'Sin datos del mes'}
        accent={floor && floor.amount < 0 ? 'expense' : 'warning'}
        floor={floor}
      />
    </div>
  );
}

function Block({
  icon,
  title,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  hint: string;
  accent: 'primary' | 'warning' | 'expense';
  floor?: MinBalancePoint | null;
}) {
  const color =
    accent === 'primary'
      ? 'text-primary'
      : accent === 'expense'
        ? 'text-expense'
        : 'text-warning';
  const bg =
    accent === 'primary'
      ? 'bg-primary-soft'
      : accent === 'expense'
        ? 'bg-expense-soft'
        : 'bg-[rgba(245,158,11,0.12)]';

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${bg} ${color}`}>
          {icon}
        </span>
        {title}
      </div>
      <p className={`mt-3 text-2xl font-semibold ${color}`}>{formatCurrency(value)}</p>
      <p className="mt-1 text-[11px] text-muted">{hint}</p>
    </div>
  );
}
