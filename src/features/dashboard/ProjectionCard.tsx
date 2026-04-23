import { TrendingUp, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { MinBalancePoint, ProjectionPoint, endOfMonthProjection, worstCaseFloor } from '@/lib/calc';

export function ProjectionCard({ points }: { points: ProjectionPoint[] }) {
  const eom = endOfMonthProjection(points);
  const floor = worstCaseFloor(points);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {/* Proyección a fin de mes */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-analytics-soft text-analytics">
            <TrendingUp size={14} />
          </span>
          <span className="text-xs font-medium text-muted">A fin de mes</span>
        </div>
        {/* Estimación — línea principal */}
        <p className="mt-3 text-2xl font-semibold text-analytics sm:text-3xl">
          {formatCurrency(eom.estimated)}
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-[11px] text-muted">
            <span className="font-medium text-warning">Piso:</span>{' '}
            {formatCurrency(eom.worst)}
          </p>
          {eom.actual !== null && (
            <p className="text-[11px] text-muted">
              <span className="font-medium text-income">Realidad actual:</span>{' '}
              {formatCurrency(eom.actual)}
            </p>
          )}
        </div>
      </div>

      {/* Piso del mes */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              floor && floor.amount < 0
                ? 'bg-expense-soft text-expense'
                : 'bg-[rgba(245,158,11,0.12)] text-warning'
            }`}
          >
            <ShieldAlert size={14} />
          </span>
          <span className="text-xs font-medium text-muted">Piso del mes</span>
        </div>
        <p
          className={`mt-3 text-2xl font-semibold sm:text-3xl ${
            floor && floor.amount < 0 ? 'text-expense' : 'text-warning'
          }`}
        >
          {formatCurrency(floor?.amount ?? 0)}
        </p>
        <p className="mt-1.5 text-[11px] text-muted">
          {floor ? `Fecha más crítica: ${formatDateLong(floor.date)}` : 'Sin datos aún'}
        </p>
      </div>
    </div>
  );
}

// kept for type import compatibility
export type { MinBalancePoint };
