import { useMemo, useState } from 'react';
import { addMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { BalanceCard } from '@/features/dashboard/BalanceCard';
import { MonthSummary } from '@/features/dashboard/MonthSummary';
import { ProjectionCard } from '@/features/dashboard/ProjectionCard';
import { CashflowChart } from '@/features/dashboard/CashflowChart';
import { UpcomingList } from '@/features/dashboard/UpcomingList';
import { ProjectionSettingsModal } from '@/features/dashboard/ProjectionSettingsModal';
import { currentBalance, projectIncomeByDay, monthIncomeProjection, monthSummary, upcoming } from '@/lib/calc';
import { monthLabel } from '@/lib/date';

export function DashboardPage() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const startingBalance = useTransactionsStore((s) => s.settings.startingBalance);
  const projectionSettings = useTransactionsStore((s) => s.settings.projectionSettings);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());

  const today = useMemo(() => new Date(), []);
  const isCurrentMonth = isSameMonth(viewMonth, today);

  const balance = useMemo(
    () => startingBalance + currentBalance(transactions),
    [transactions, startingBalance],
  );
  const summary = useMemo(
    () => monthSummary(transactions, viewMonth),
    [transactions, viewMonth],
  );
  const incomePoints = useMemo(
    () => projectIncomeByDay(transactions, viewMonth, projectionSettings),
    [transactions, viewMonth, projectionSettings],
  );
  const hasProjection =
    projectionSettings.workDays.length > 0 &&
    (projectionSettings.estimatedMonthlyIncome > 0 || projectionSettings.worstMonthlyIncome > 0);
  const incomeProjection = useMemo(
    () => monthIncomeProjection(transactions, viewMonth, projectionSettings),
    [transactions, viewMonth, projectionSettings],
  );
  const next = useMemo(() => upcoming(transactions, 14), [transactions]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Dashboard</p>
          {/* Month navigator */}
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="text-2xl font-semibold capitalize sm:text-3xl">
              {monthLabel(viewMonth)}
            </h1>
            <button
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
            {!isCurrentMonth && (
              <button
                onClick={() => setViewMonth(new Date())}
                className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary"
              >
                Hoy
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Ingresos confirmados, meta estimada y piso del mes — de un vistazo.
          </p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="mt-1 flex shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
          title="Configurar metas del mes"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Proyecciones</span>
        </button>
      </header>

      <BalanceCard balance={balance} />
      <MonthSummary summary={summary} />
      <ProjectionCard income={incomeProjection} isCurrentMonth={isCurrentMonth} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-5">
        <CashflowChart points={incomePoints} hasProjection={hasProjection} isCurrentMonth={isCurrentMonth} />
        <UpcomingList items={next} />
      </div>

      <ProjectionSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
