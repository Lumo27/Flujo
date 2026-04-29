import { TrendingUp, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { MinBalancePoint } from '@/lib/calc';

interface IncomeProjection {
  /** Sum of confirmed income with real amounts. */
  actual: number;
  /** All income at estimated/average scenario. */
  estimated: number;
  /** All income at worst-case scenario. */
  worst: number;
}

interface Props {
  income: IncomeProjection;
  isCurrentMonth: boolean;
}

export function ProjectionCard({ income, isCurrentMonth }: Props) {
  const hasActual = income.actual > 0 && isCurrentMonth;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {/* Estimación a fin de mes */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-analytics-soft text-analytics">
            <TrendingUp size={14} />
          </span>
          <span className="text-xs font-medium text-muted">A fin de mes</span>
        </div>

        <p className="mt-3 text-2xl font-semibold text-analytics sm:text-3xl">
          {formatCurrency(income.estimated)}
        </p>

        <p className="mt-1 text-[11px] text-muted">
          Ingresos totales estimados del mes
        </p>

        {hasActual && (
          <div className="mt-3 border-t border-border/50 pt-3">
            <p className="text-[11px] text-muted">
              <span className="font-medium text-income">Realidad hasta hoy:</span>{' '}
              {formatCurrency(income.actual)}
            </p>
          </div>
        )}
      </div>

      {/* Piso del mes — peor escenario de ingresos */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(245,158,11,0.12)] text-warning">
            <ShieldAlert size={14} />
          </span>
          <span className="text-xs font-medium text-muted">Piso del mes</span>
        </div>

        <p className="mt-3 text-2xl font-semibold text-warning sm:text-3xl">
          {formatCurrency(income.worst)}
        </p>

        <p className="mt-1 text-[11px] text-muted">
          Ingresos en el peor escenario posible
        </p>

        {hasActual && (
          <div className="mt-3 border-t border-border/50 pt-3">
            <p className="text-[11px] text-muted">
              <span className="font-medium text-analytics">Estimado:</span>{' '}
              {formatCurrency(income.estimated)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// kept for type import compatibility
export type { MinBalancePoint };
