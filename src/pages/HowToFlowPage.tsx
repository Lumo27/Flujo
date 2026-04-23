import {
  SlidersHorizontal,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  BadgeCheck,
  Banknote,
  ArrowLeftRight,
  ShieldAlert,
  Shuffle,
  Wallet,
} from 'lucide-react';

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: SlidersHorizontal,
    color: 'text-primary bg-primary-soft',
    number: '01',
    title: 'Ajustá tu base',
    description:
      'Indicá con cuánta plata arrancás el mes. Este número es el punto de partida de toda la proyección — podés cambiarlo cuando quieras desde el dashboard.',
  },
  {
    icon: PlusCircle,
    color: 'text-income bg-income-soft',
    number: '02',
    title: 'Cargá tus movimientos',
    description:
      'Sumá ingresos y gastos esperados con su fecha y monto estimado. Para los variables (como propinas), podés definir un piso conservador que se usa en el peor escenario.',
  },
  {
    icon: TrendingUp,
    color: 'text-analytics bg-analytics-soft',
    number: '03',
    title: 'Seguí la proyección',
    description:
      'Flujo calcula tu saldo día a día hasta fin de mes en dos versiones: la estimada (mejor caso) y la del peor escenario. Así sabés con certeza si llegás a cada pago.',
  },
  {
    icon: CheckCircle2,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    number: '04',
    title: 'Confirmá cuando pasan',
    description:
      'Cuando un movimiento ocurre, lo marcás como confirmado con el monto real. Flujo registra la diferencia vs lo estimado y actualiza tu saldo en tiempo real.',
  },
];

// ─── Glossary ─────────────────────────────────────────────────────────────────

const glossary = [
  {
    icon: Clock,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    term: 'Pendiente',
    definition: 'Ingreso o gasto que todavía no ocurrió. El monto es una estimación — no modifica tu saldo real hasta que lo confirmás.',
    example: 'Turno del sábado que viene: $45.000 estimado.',
  },
  {
    icon: BadgeCheck,
    color: 'text-income bg-income-soft',
    term: 'Confirmado',
    definition: 'El movimiento ya ocurrió. Ingresaste el monto real y pasa a contar en tu saldo.',
    example: 'Turno del sábado pasado: $45.000 cobrado.',
  },
  {
    icon: Banknote,
    color: 'text-primary bg-primary-soft',
    term: 'Monto estimado',
    definition: 'Lo que esperás cobrar o pagar. Se usa para proyectar tu saldo futuro mientras el movimiento está pendiente.',
    example: 'Propinas estimadas: $100.000.',
  },
  {
    icon: ArrowLeftRight,
    color: 'text-analytics bg-analytics-soft',
    term: 'Diferencia (real vs estimado)',
    definition: 'Cuánto se desvió el monto real del estimado al confirmar. Verde si fue mejor de lo esperado, rojo si fue peor.',
    example: 'Estimaste $100.000 en propinas y cobraste $118.000 → +$18.000.',
  },
  {
    icon: TrendingUp,
    color: 'text-analytics bg-analytics-soft',
    term: 'Proyección',
    definition: 'Saldo calculado día a día usando los montos estimados de todos los movimientos pendientes. Te muestra hacia dónde va tu mes.',
    example: 'Hoy tenés $200.000, los próximos movimientos te llevan a $350.000 a fin de mes.',
  },
  {
    icon: ShieldAlert,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    term: 'Peor escenario',
    definition: 'Proyección usando el piso conservador de los ingresos variables. Te muestra el saldo mínimo garantizado si todo sale al límite inferior.',
    example: 'Si tus propinas bajan al piso de $60.000 cada semana, a fin de mes tendrías $280.000.',
  },
  {
    icon: ShieldAlert,
    color: 'text-expense bg-expense-soft',
    term: 'Piso del mes',
    definition: 'El saldo más bajo al que vas a llegar en cualquier punto del mes, según el peor escenario. Es la cifra clave para saber si llegás a cada pago.',
    example: 'Tu piso es $85.000 el día 18 — el alquiler vence ese día.',
  },
  {
    icon: Shuffle,
    color: 'text-primary bg-primary-soft',
    term: 'Variable',
    definition: 'Movimiento cuyo monto no es fijo de antemano. Podés cargar un monto estimado y un piso conservador para el peor escenario.',
    example: 'Propinas: estimado $100.000, piso $60.000.',
  },
  {
    icon: Wallet,
    color: 'text-primary bg-primary-soft',
    term: 'Saldo base',
    definition: 'Con cuánta plata arrancás el mes. Todos los cálculos parten de este número. Podés ajustarlo en cualquier momento desde el dashboard.',
    example: 'Si arrancás el mes con $150.000, ese es tu saldo base.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HowToFlowPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">

      {/* Header */}
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Guía</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">¿Cómo Fluir?</h1>
        <p className="mt-1.5 text-sm text-muted">
          Todo lo que necesitás saber para tener tu mes bajo control, en un solo lugar.
        </p>
      </header>

      {/* Steps */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-text">Primeros pasos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${step.color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-widest text-muted">{step.number}</span>
                    <h3 className="text-sm font-semibold text-text">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Glossary */}
      <section>
        <h2 className="mb-1 text-base font-semibold text-text">Glosario</h2>
        <p className="mb-4 text-sm text-muted">
          Los términos que vas a ver en la app, con ejemplos concretos.
        </p>
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          {glossary.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.term} className="flex gap-4 px-5 py-4 transition-colors hover:bg-surface-2/60">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">{item.term}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.definition}</p>
                  <p className="mt-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-muted/80 italic">
                    Ej: {item.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
