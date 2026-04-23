import { X, SlidersHorizontal, PlusCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTransactionsStore } from '@/store/useTransactionsStore';

const steps = [
  {
    icon: SlidersHorizontal,
    color: 'text-primary bg-primary-soft',
    title: 'Ajustá tu base',
    description: 'Indicá con cuánta plata arrancás el mes. Es el punto de partida de toda la proyección.',
  },
  {
    icon: PlusCircle,
    color: 'text-income bg-income-soft',
    title: 'Cargá tus movimientos',
    description: 'Ingresos y gastos esperados con fecha y monto. Para los variables, sumá un piso conservador.',
  },
  {
    icon: TrendingUp,
    color: 'text-analytics bg-analytics-soft',
    title: 'Seguí la proyección',
    description: 'Flujo calcula tu saldo día a día en dos escenarios: el estimado y el peor caso posible.',
  },
  {
    icon: CheckCircle2,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    title: 'Confirmá cuando pasan',
    description: 'A medida que ocurren, marcá cada movimiento con el monto real. La diferencia queda registrada.',
  },
];

export function HowToFlowCard() {
  const dismissed = useTransactionsStore((s) => s.settings.onboardingDismissed);
  const dismiss = useTransactionsStore((s) => s.dismissOnboarding);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-analytics/5" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Primeros pasos</p>
            <h2 className="mt-1 text-lg font-semibold text-text">¿Cómo Fluir?</h2>
            <p className="mt-0.5 text-sm text-muted">
              Cuatro pasos para tener tu mes bajo control.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-surface-2/50 p-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.color}`}>
                    <Icon size={15} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Paso {i + 1}
                  </span>
                </div>
                <p className="text-sm font-semibold text-text leading-snug">{step.title}</p>
                <p className="text-xs text-muted leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Esta guía no vuelve a aparecer una vez que la cerrás.
          </p>
          <button
            onClick={dismiss}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_4px_16px_-6px_rgba(59,130,246,0.6)] transition-colors hover:bg-primary-hover"
          >
            Listo, a fluir →
          </button>
        </div>
      </div>
    </div>
  );
}
