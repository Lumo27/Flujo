import { useMemo } from 'react';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { BalanceCard } from '@/features/dashboard/BalanceCard';
import { MonthSummary } from '@/features/dashboard/MonthSummary';
import { ProjectionCard } from '@/features/dashboard/ProjectionCard';
import { CashflowChart } from '@/features/dashboard/CashflowChart';
import { UpcomingList } from '@/features/dashboard/UpcomingList';
import { currentBalance, monthSummary, projectMonth, upcoming } from '@/lib/calc';
import { HowToFlowCard } from '@/features/dashboard/HowToFlowCard';

export function DashboardPage() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const startingBalance = useTransactionsStore((s) => s.settings.startingBalance);

  const now = useMemo(() => new Date(), []);
  const balance = useMemo(
    () => startingBalance + currentBalance(transactions),
    [transactions, startingBalance],
  );
  const summary = useMemo(() => monthSummary(transactions, now), [transactions, now]);
  const points = useMemo(
    () => projectMonth(transactions, now, startingBalance),
    [transactions, now, startingBalance],
  );
  const next = useMemo(() => upcoming(transactions, 14), [transactions]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Tu flujo del mes</h1>
        <p className="mt-1 text-sm text-muted">
          Saldo real, proyección estimada y peor escenario — de un vistazo.
        </p>
      </header>

      <HowToFlowCard />
      <BalanceCard balance={balance} />
      <MonthSummary summary={summary} />
      <ProjectionCard points={points} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-5">
        <CashflowChart points={points} />
        <UpcomingList items={next} />
      </div>
    </div>
  );
}
