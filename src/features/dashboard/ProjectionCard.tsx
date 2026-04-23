import { TrendingUp, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { MinBalancePoint, ProjectionPoint, endOfMonthProjection, worstCaseFloor } from '@/lib/calc';

export function ProjectionCard({ points }: { points: ProjectionPoint[] }) {
  const eom = endOfMonthProjection(points);
  const floor = worstCaseFloor(points);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {/* Proyección usa violeta — es análisis, no acción */}
      <Block
        icon={<TrendingUp size={14} />}
        title="A fin de mes"
        value={eom.estimated}
        sub={`Peor caso: ${formatCurrency(eom.worst)}`}
        accent="analytics"
      />
      <Block
        icon={<ShieldAlert size={14} />}
        title="Piso del mes"
        value={floor?.amount ?? 0}
        sub={floor ? `Fecha más crítica: ${formatDateLong(floor.date)}` : 'Sin datos aún'}
        accent={floor && floor.amount < 0 ? 'expense' : 'warning'}
        floor={floor}
      />
    </div>
  );
}

type Accent = 'analytics' | 'warning' | 'expense';

function Block({
  icon,
  title,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  sub: string;
  accent: Accent;
  floor?: MinBalancePoint | null;
}) {
  const colorMap: Record<Accent, { text: string; bg: string }> = {
    analytics: { text: 'text-analytics', bg: 'bg-analytics-soft' },
    expense: { text: 'text-expense', bg: 'bg-expense-soft' },
    warning: { text: 'text-warning', bg: 'bg-[rgba(245,158,11,0.12)]' },
  };
  const { text, bg } = colorMap[accent];

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${text}`}>
          {icon}
        </span>
        <span className="text-xs font-medium text-muted">{title}</span>
      </div>
      <p className={`mt-3 text-2xl font-semibold sm:text-3xl ${text}`}>
        {formatCurrency(value)}
      </p>
      <p className="mt-1.5 text-[11px] text-muted">{sub}</p>
    </div>
  );
}
