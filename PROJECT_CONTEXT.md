# Flujo — Contexto del proyecto

Documento vivo con las decisiones principales del producto, stack, arquitectura, diseño, alcance y restricciones. Sirve como fuente única de verdad para mantener consistencia a medida que el proyecto evoluciona.

---

## 1. Producto

**Flujo** es una app web personal para **proyectar, controlar y anticipar el dinero del mes**. No es un tracker retrospectivo de gastos: el foco está en **saber cómo va a evolucionar tu saldo hacia adelante**, distinguiendo lo que ya pasó de lo que todavía es una estimación.

### Caso de uso real

Una persona con **ingresos parcialmente variables** (ej. sueldo fijo de fin de semana + propina variable) y **gastos en su mayoría fijos** (alquiler, servicios) quiere:

- Cargar ingresos y pagos esperados del mes.
- Ver cómo queda su saldo día a día hasta fin de mes.
- Saber el **piso proyectado** (peor escenario) y en qué día ocurre — para decidir si llega a un pago puntual.
- A medida que pasan los días, **confirmar movimientos con el monto real** y ver la diferencia estimado vs real.

### Propuesta de valor

- **Claridad sobre el futuro**, no solo historial.
- **Escenario estimado y pesimista** lado a lado.
- Interfaz que transmite **control y orden** — estética fintech moderna.

---

## 2. Alcance del MVP

### Incluido

- Dashboard con saldo actual, ingresos y gastos del mes, proyección a fin de mes, piso proyectado, gráfico de cashflow y próximos movimientos.
- Crear, editar y eliminar movimientos.
- Confirmar movimientos pendientes con monto real.
- Listado de movimientos con filtro (todos, ingresos, gastos, pendientes).
- Vista calendario mensual con movimientos por día y saldo proyectado.
- Saldo inicial manual configurable.
- Datos de ejemplo realistas al primer uso.
- Responsive mobile-first con navegación inferior en mobile y sidebar en desktop.

### Excluido (por ahora)

- Autenticación.
- Backend o sync entre dispositivos.
- Múltiples cuentas o monedas.
- Integraciones bancarias / pagos reales.
- Recurrencia automática de movimientos (se cargan uno a uno).
- Notificaciones push.
- Export / import de datos (futuro cercano).

---

## 3. Stack

- **React 18 + Vite + TypeScript (strict)** — estándar moderno, DX rápida.
- **Tailwind CSS 3** — tokens de diseño en `tailwind.config.ts`.
- **React Router v6** — tres rutas: `/`, `/movimientos`, `/calendario`.
- **Zustand + persist middleware** — estado global con persistencia en `localStorage`.
- **date-fns** — manejo de fechas, grid de calendario.
- **lucide-react** — iconografía consistente.
- **recharts** — gráfico de proyección de cashflow.

### Persistencia

- Clave `flujo:v1` en `localStorage`, vía middleware `persist` de Zustand.
- Versionado (`version: 1`) para permitir migraciones futuras sin romper datos.
- Seed data se inserta en la primera carga y forma parte del estado persistido.

---

## 4. Arquitectura

Capas con responsabilidades claras y dependencias unidireccionales:

```
types  →  lib  →  store  →  features / components  →  pages  →  App
```

- **`types/`** — contratos de dominio (Transaction, Category, etc.). Sin lógica.
- **`lib/`** — utilidades puras y testeables (format, date, calc, cn, id).
- **`store/`** — Zustand con persist. Única fuente de verdad.
- **`data/`** — seed y datos estáticos.
- **`components/ui/`** — primitivos reutilizables, agnósticos de dominio.
- **`components/layout/`** — layout principal, sidebar, topbar, bottom nav.
- **`features/<feature>/`** — componentes específicos de un dominio (dashboard, transactions, calendar).
- **`pages/`** — ensambla features para una ruta.

### Reglas

- Los componentes leen del store con selectores específicos (no desestructuran todo).
- Cálculos derivados (saldo, proyección, resumen) viven en `lib/calc.ts` — puros, sin React.
- Memoización con `useMemo` en pages para derivados costosos.

---

## 5. Modelo de datos

```ts
type Transaction = {
  id: string;
  type: 'income' | 'expense';
  status: 'pending' | 'confirmed';
  variability: 'fixed' | 'variable';
  category: TransactionCategory;
  title: string;
  note?: string;
  date: string;              // ISO YYYY-MM-DD
  estimatedAmount: number;   // siempre positivo
  actualAmount?: number;     // al confirmar
  minAmount?: number;        // piso conservador (ingresos variables)
  createdAt: string;
  updatedAt: string;
};
```

### Decisiones clave

- Montos **siempre positivos**; el signo se deriva de `type`.
- `pending` vs `confirmed` separa estimación de realidad.
- `minAmount` solo se usa en ingresos variables, para calcular peor escenario.
- Fecha como string ISO para simplificar persistencia y comparaciones.

---

## 6. Cálculos

Definidos en `src/lib/calc.ts`:

- `currentBalance`: suma de `actualAmount` (o estimado si no hay) de confirmados, con signo.
- `monthSummary`: totales del mes separando confirmado vs proyectado.
- `projectMonth`: saldo día por día para el mes, en dos modos — **estimado** (best guess) y **peor** (usa `minAmount` para variables).
- `worstCaseFloor`: mínimo de la serie "peor" — da fecha y monto.
- `endOfMonthProjection`: último punto de la proyección.
- `upcoming`: pendientes dentro de los próximos N días.

---

## 7. Diseño

### Tokens (Tailwind)

| Token       | Valor     | Uso                         |
|-------------|-----------|-----------------------------|
| `bg`        | `#0B0B12` | Fondo app                   |
| `surface`   | `#14141F` | Cards / sidebar             |
| `surface-2` | `#1C1C2B` | Inputs, estados hover       |
| `border`    | `#262636` | Bordes sutiles              |
| `text`      | `#E8E8F0` | Texto principal             |
| `muted`     | `#8A8AA3` | Texto secundario / labels   |
| `primary`   | `#7C5CFF` | Acento (violeta)            |
| `income`    | `#22C55E` | Ingresos                    |
| `expense`   | `#EF4444` | Gastos                      |
| `warning`   | `#F59E0B` | Pendiente / peor escenario  |

### Principios

- **Dark mode único** (sin toggle por ahora).
- **Mobile-first**: breakpoints `sm` / `lg`. Navegación inferior en mobile, sidebar fija en desktop.
- **Cards claras** con borde sutil + sombra suave.
- **Jerarquía tipográfica** fuerte (Inter): títulos semibold, números grandes para cifras clave.
- **Estados vacíos** consistentes con `EmptyState`.
- **Color como información**: verde/rojo para signo, violeta para proyección, ámbar para peor escenario / pendiente.

---

## 8. Restricciones

- Sin auth.
- Sin backend.
- Sin pagos reales.
- Sin integraciones externas.
- Sin librerías innecesarias — cada dependencia debe justificar su peso.
- Sin sobreingeniería — estructura simple pero con bases sólidas.

---

## 9. Roadmap post-MVP (tentativo)

- Edición inline de movimientos existentes.
- Recurrencia (ej. "cada 1° del mes").
- Comparativa mes a mes.
- Export/import JSON.
- Categorías con color propio y filtros por categoría.
- Modo múltiples monedas.
- Sync opcional con backend (Supabase o similar).

---

## 10. Calidad y convenciones

- TypeScript en modo `strict`.
- Naming en español cuando es UI (labels), en inglés para código.
- Paths con alias `@/*` para evitar `../../../`.
- Componentes pequeños y con responsabilidad única.
- Formularios controlados simples — sin librería de forms hasta que haga falta.
