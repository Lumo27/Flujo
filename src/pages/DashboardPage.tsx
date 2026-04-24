import { useMemo, useState } from 'react';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { BalanceCard } from '@/features/dashboard/BalanceCard';
import { MonthSummary } from '@/features/dashboard/MonthSummary';
import { ProjectionCard } from '@/features/dashboard/ProjectionCard';
import { CashflowChart } from '@/features/dashboard/CashflowChart';
import { UpcomingList } from '@/features/dashboard/UpcomingList';
import { ProjectionSettingsModal } from '@/features/dashboard/ProjectionSettingsModal';
import { currentBalance, projectIncomeByDay, monthIncomeProjection, monthSummary, upcoming } from '@/lib/calc';
import { SlidersHorizontal } from 'lucide-react';

export function DashboardPage() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const startingBalance = useTransactionsStore((s) => s.settings.startingBalance);
  const projectionSettings = useTransactionsStore((s) => s.settings.projectionSettings);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const balance = useMemo(
    () => startingBalance + currentBalance(transactions),
    [transactions, startingBalance],
  );
  const summary = useMemo(() => monthSummary(transactions, now), [transactions, now]);
  const incomePoints = useMemo(
    () => projectIncomeByDay(transactions, now, projectionSettings),
    [transactions, now, projectionSettings],
  );
  const hasProjection =
    projectionSettings.workDays.length > 0 &&
    (projectionSettings.estimatedMonthlyIncome > 0 || projectionSettings.worstMonthlyIncome > 0);
  const incomeProjection = useMemo(
    () => monthIncomeProjection(transactions, now, projectionSettings),
    [transactions, now, projectionSettings],
  );
  const next = useMemo(() => upcoming(transactions, 14), [transactions]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Tu flujo del mes</h1>
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
      <ProjectionCard income={incomeProjection} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-5">
        <CashflowChart points={incomePoints} hasProjection={hasProjection} />
        <UpcomingList items={next} />
      </div>

      <ProjectionSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
