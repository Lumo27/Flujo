import { Transaction } from '@/types/transaction';
import { toISO } from '@/lib/date';

/**
 * Seed de demostración. Narrativa:
 *
 *   Saldo base:   $40.000
 *   3 fines de semana confirmados (5-6, 12-13, 19-20 de abril).
 *   1 fin de semana pendiente (24-25 de abril = mañana y pasado).
 *
 *   Propinas estimadas: $145.000/turno  →  línea Estimación
 *   Propinas mínimas:    $85.000/turno  →  línea Piso
 *   Propinas reales:    ~$130.000/turno →  línea Realidad (siempre entre est. y piso)
 *
 * Valores al fin de mes (30 de abril):
 *   Estimación ≈ $1.300.000
 *   Piso       ≈   $820.000
 *   Realidad (hoy, antes del finde 24-25) ≈ $870.000
 *
 * El alquiler cae el día 8 (DESPUÉS del primer fin de semana) para que
 * el peor escenario nunca baje a negativo → el "Piso del mes" es positivo.
 */
export function buildSeed(): Transaction[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const day = (n: number) => toISO(new Date(y, m, n));
  const ts = new Date().toISOString();
  let i = 0;
  const mk = (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => ({
    ...t,
    id: `seed_${++i}`,
    createdAt: ts,
    updatedAt: ts,
  });

  return [
    // ── 1° fin de semana confirmado (5-6) ───────────────────────────────────
    mk({
      type: 'income', status: 'confirmed', variability: 'fixed', category: 'salary',
      title: 'Turno sábado', date: day(5),
      estimatedAmount: 45_000, actualAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'variable', category: 'tips',
      title: 'Propinas sábado', date: day(5),
      estimatedAmount: 145_000, minAmount: 85_000, actualAmount: 130_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'fixed', category: 'salary',
      title: 'Turno domingo', date: day(6),
      estimatedAmount: 45_000, actualAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'variable', category: 'tips',
      title: 'Propinas domingo', date: day(6),
      estimatedAmount: 145_000, minAmount: 85_000, actualAmount: 120_000,
    }),

    // ── Alquiler — día 8, DESPUÉS del primer finde ──────────────────────────
    mk({
      type: 'expense', status: 'confirmed', variability: 'fixed', category: 'rent',
      title: 'Alquiler', date: day(8),
      estimatedAmount: 150_000, actualAmount: 150_000,
    }),

    // ── 2° fin de semana confirmado (12-13) ─────────────────────────────────
    mk({
      type: 'income', status: 'confirmed', variability: 'fixed', category: 'salary',
      title: 'Turno sábado', date: day(12),
      estimatedAmount: 45_000, actualAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'variable', category: 'tips',
      title: 'Propinas sábado', date: day(12),
      estimatedAmount: 145_000, minAmount: 85_000, actualAmount: 145_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'fixed', category: 'salary',
      title: 'Turno domingo', date: day(13),
      estimatedAmount: 45_000, actualAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'variable', category: 'tips',
      title: 'Propinas domingo', date: day(13),
      estimatedAmount: 145_000, minAmount: 85_000, actualAmount: 125_000,
    }),

    mk({
      type: 'expense', status: 'confirmed', variability: 'fixed', category: 'utilities',
      title: 'Luz', date: day(15),
      estimatedAmount: 20_000, actualAmount: 20_000,
    }),

    // ── 3° fin de semana confirmado (19-20) ─────────────────────────────────
    mk({
      type: 'income', status: 'confirmed', variability: 'fixed', category: 'salary',
      title: 'Turno sábado', date: day(19),
      estimatedAmount: 45_000, actualAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'variable', category: 'tips',
      title: 'Propinas sábado', date: day(19),
      estimatedAmount: 145_000, minAmount: 85_000, actualAmount: 140_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'fixed', category: 'salary',
      title: 'Turno domingo', date: day(20),
      estimatedAmount: 45_000, actualAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'confirmed', variability: 'variable', category: 'tips',
      title: 'Propinas domingo', date: day(20),
      estimatedAmount: 145_000, minAmount: 85_000, actualAmount: 130_000,
    }),

    mk({
      type: 'expense', status: 'confirmed', variability: 'variable', category: 'groceries',
      title: 'Supermercado', date: day(21),
      estimatedAmount: 55_000, actualAmount: 61_000,
    }),

    // ── 4° fin de semana PENDIENTE (24-25) ──────────────────────────────────
    mk({
      type: 'income', status: 'pending', variability: 'fixed', category: 'salary',
      title: 'Turno sábado', date: day(24),
      estimatedAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'pending', variability: 'variable', category: 'tips',
      title: 'Propinas sábado', date: day(24),
      note: 'Estimación ~145k, piso conservador 85k',
      estimatedAmount: 145_000, minAmount: 85_000,
    }),
    mk({
      type: 'income', status: 'pending', variability: 'fixed', category: 'salary',
      title: 'Turno domingo', date: day(25),
      estimatedAmount: 45_000,
    }),
    mk({
      type: 'income', status: 'pending', variability: 'variable', category: 'tips',
      title: 'Propinas domingo', date: day(25),
      estimatedAmount: 145_000, minAmount: 85_000,
    }),

    // ── Gastos de cierre (pendientes) ───────────────────────────────────────
    mk({
      type: 'expense', status: 'pending', variability: 'fixed', category: 'utilities',
      title: 'Internet', date: day(28),
      estimatedAmount: 15_000,
    }),
    mk({
      type: 'expense', status: 'pending', variability: 'variable', category: 'groceries',
      title: 'Supermercado cierre de mes', date: day(28),
      estimatedAmount: 20_000,
    }),
  ];
}

/*
 * Verificación matemática (proyectedDelta — usa montos estimados/peor para TODAS las txs):
 *
 *  startingBalance = 40.000
 *
 *  Estimación (8 turnos × 190k + gastos por estimatedAmount):
 *    8 × (45k + 145k) = 1.520k  →  40k + 1.520k − 150k − 20k − 55k − 35k = 1.300k ✓
 *
 *  Piso (8 turnos × 130k + gastos por estimatedAmount):
 *    8 × (45k + 85k) = 1.040k   →  40k + 1.040k − 260k = 820k ≈ 800k ✓
 *
 *  Realidad (solo confirmadas, montos reales):
 *    income actual: (130+120+145+125+140+130)k + 6×45k = 790k + 270k = 1.060k
 *    expenses:      150k + 20k + 61k = 231k
 *    40k + 1.060k − 231k = 869k ≈ 870k ✓  (falta el finde 24-25)
 *
 *  Piso del mes (mínimo del peor escenario):
 *    El alquiler (150k) cae el día 8, DESPUÉS del primer finde (+260k worst).
 *    Piso en día 8: 40k + 260k − 150k = 150k  →  POSITIVO ✓ (no muestra rojo)
 */
