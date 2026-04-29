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
  DollarSign,
  CalendarDays,
  Trash2,
} from 'lucide-react';

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: SlidersHorizontal,
    color: 'text-primary bg-primary-soft',
    number: '01',
    title: 'Configurá tus metas y tipo de cambio',
    description:
      'Al principio del mes, abrí Proyecciones. Ingresá tu meta de fin de mes (Estimado) y el peor escenario (Peor fin de mes). Luego marcá los días que vas a trabajar, e ingresá cuánto cobrás por turno — ese monto se asigna a cada turno para ver tu ritmo en el gráfico. También podés setear el dólar blue si tenés ingresos en USD.',
  },
  {
    icon: PlusCircle,
    color: 'text-income bg-income-soft',
    number: '02',
    title: 'Cargá tus movimientos',
    description:
      'Sumá ingresos y gastos con su fecha y monto. Podés seleccionar varios días a la vez en el calendario para cargar el mismo movimiento en múltiples fechas. Los gastos fijos se confirman automáticamente; los ingresos y gastos variables quedan pendientes hasta que ocurran. Podés cargar en pesos ($) o dólares (U$S).',
  },
  {
    icon: TrendingUp,
    color: 'text-analytics bg-analytics-soft',
    number: '03',
    title: 'Seguí el gráfico día a día',
    description:
      'La línea verde muestra tus ingresos confirmados acumulados. La violeta punteada es tu meta estimada y la naranja tu piso del mes, ambas distribuidas en escalera según tus días de trabajo. Podés navegar entre meses con las flechas del dashboard para ver histórico o planificar el futuro.',
  },
  {
    icon: CheckCircle2,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    number: '04',
    title: 'Confirmá cuando pasan',
    description:
      'Cuando un movimiento ocurre, lo marcás como confirmado con el monto real. Flujo registra la diferencia vs lo estimado y la línea de Realidad sube. Los gastos fijos no necesitan confirmación — ya están registrados.',
  },
];

// ─── Glossary ─────────────────────────────────────────────────────────────────

const glossary = [
  {
    icon: Clock,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    term: 'Pendiente',
    definition: 'Ingreso o gasto que todavía no ocurrió. El monto es una estimación y no modifica tu saldo real hasta que lo confirmás.',
    example: 'Turno del viernes que viene: $45.000 estimado.',
  },
  {
    icon: BadgeCheck,
    color: 'text-income bg-income-soft',
    term: 'Confirmado',
    definition: 'El movimiento ya ocurrió. Ingresaste el monto real y pasa a contar en tu saldo y en la línea de Realidad del gráfico.',
    example: 'Turno del viernes pasado: $45.000 cobrado.',
  },
  {
    icon: Banknote,
    color: 'text-primary bg-primary-soft',
    term: 'Monto estimado',
    definition: 'Lo que esperás cobrar o pagar. Se usa para mostrar el movimiento antes de confirmarlo.',
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
    term: 'A fin de mes (Estimación)',
    definition: 'Meta total de ingresos que seteaste para el mes. Es el ingreso bruto — vos le restás tus gastos conocidos para saber cuánto te queda.',
    example: 'Estimación: $1.200.000. Gastos fijos: $450.000. Te quedan ~$750.000.',
  },
  {
    icon: ShieldAlert,
    color: 'text-warning bg-[rgba(245,158,11,0.12)]',
    term: 'Piso del mes',
    definition: 'Meta total de ingresos en el peor escenario posible. Se configura una sola vez y es independiente de los movimientos cargados.',
    example: 'Piso: $900.000. Si todo sale mal, igual superás tus gastos fijos de $450.000.',
  },
  {
    icon: CalendarDays,
    color: 'text-primary bg-primary-soft',
    term: 'Días de trabajo',
    definition: 'Los días que marcás en Proyecciones como días laborales. La línea del gráfico sube lo que cobrás por turno en cada uno de esos días.',
    example: '8 turnos · $150.000/turno → la línea de Estimación sube $150.000 por turno en el gráfico.',
  },
  {
    icon: Shuffle,
    color: 'text-primary bg-primary-soft',
    term: 'Variable',
    definition: 'Movimiento cuyo monto no es fijo de antemano — por ejemplo propinas. Queda pendiente hasta que lo confirmás con el real.',
    example: 'Propinas: estimado $100.000, real $118.000 al confirmarlo.',
  },
  {
    icon: Wallet,
    color: 'text-primary bg-primary-soft',
    term: 'Saldo base',
    definition: 'Con cuánta plata arrancás el mes. Todos los cálculos de saldo disponible parten de este número.',
    example: 'Si arrancás el mes con $150.000, ese es tu saldo base.',
  },
  {
    icon: DollarSign,
    color: 'text-income bg-income-soft',
    term: 'Dólar blue (U$S)',
    definition: 'Al cargar un movimiento podés elegir la moneda: $ (pesos) o U$S (dólares). La cotización del blue se configura en Proyecciones y convierte todo a pesos para los totales.',
    example: 'Ingreso de U$S 500 con blue a $1.200 → $600.000 en los totales.',
  },
  {
    icon: Trash2,
    color: 'text-expense bg-expense-soft',
    term: 'Eliminación múltiple',
    definition: 'En el Calendario, usá "Selección múltiple" para marcar varios días y borrar todos sus movimientos de una vez.',
    example: 'Cargaste 5 viernes en fechas incorrectas — marcalos todos y eliminá en un click.',
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
