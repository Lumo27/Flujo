<div align="center">

<img src="./public/favicon.svg" width="72" height="72" alt="Flujo logo" />

## Flujo

**Proyectá, controlá y anticipá tu dinero del mes.**

</div>

---

**Flujo** es una app web personal para visualizar el flujo de dinero en el tiempo. No es un tracker retrospectivo de gastos: su foco es **saber cómo va a evolucionar tu saldo hacia adelante**, separando lo que ya pasó de lo que todavía es una estimación.

Cargás tus ingresos y pagos esperados del mes, Flujo proyecta tu saldo día a día, te muestra el peor escenario posible, y a medida que pasa el mes confirmás los movimientos con su monto real.

> **¿No sabés por dónde empezar?** La sección **Cómo Fluir** dentro de la app te guía en cuatro pasos concretos — desde configurar tu base hasta confirmar tus primeros movimientos.

---

## ✨ Por qué Flujo

- **Control sobre el futuro**, no solo historial.
- **Escenario estimado y pesimista** lado a lado — para saber si llegás a pagar esa cuenta.
- **Piso del mes**: el saldo más bajo al que vas a tocar y en qué día.
- **Estimado vs real** por movimiento — aprendé cuánto se desvía tu propia predicción.
- Interfaz tipo **billetera virtual / fintech moderna**, dark mode.

## 🧱 Stack

- **React 18 + Vite + TypeScript** (strict)
- **Tailwind CSS** — design tokens en `tailwind.config.ts`
- **Zustand** + persist — estado global en `localStorage`
- **React Router v6**
- **date-fns** — fechas y grid de calendario
- **recharts** — gráfico de cashflow
- **lucide-react** — iconografía

Sin backend. Sin auth. Todo vive en tu navegador.

## 🚀 Arrancar

```bash
npm install
npm run dev
```

Scripts:

- `npm run dev` — dev server en `http://localhost:5173`
- `npm run build` — build de producción (type-check + Vite)
- `npm run preview` — servir el build

## 📦 Estructura

```
src/
├── components/
│   ├── ui/          # Primitivos (Card, Button, Input, Badge, Modal, EmptyState)
│   └── layout/      # AppLayout con sidebar desktop + bottom nav mobile
├── features/
│   ├── dashboard/   # BalanceCard, MonthSummary, ProjectionCard, CashflowChart, UpcomingList
│   ├── transactions/# Lista, item, filtro, modal de creación y edición
│   └── calendar/    # MonthCalendar con saldo proyectado por día
├── store/           # Zustand + persist (única fuente de verdad)
├── lib/             # format, date, calc, cn, id (utilidades puras)
├── types/           # contratos de dominio (Transaction, Category)
├── data/            # seed realista para first-run
└── pages/           # Dashboard, Transactions, Calendar
```

## 🎯 Pantallas

- **Dashboard** — saldo actual, ingresos/gastos del mes, proyección a fin de mes, piso proyectado, gráfico, próximos 14 días.
- **Movimientos** — lista agrupada por día, filtro por tipo/pendientes, crear, editar y confirmar con monto real.
- **Calendario** — grilla mensual con dots por día y saldo proyectado.

## 🎨 Decisiones de diseño

- **Dark mode único** para mantener foco y consistencia.
- **Mobile-first**: bottom nav en mobile, sidebar en desktop.
- **Color como información**: azul para acciones, verde ingreso, rojo gasto, violeta proyección, ámbar pendiente.
- **Cards bien marcadas** con borde sutil + sombra suave.

## 💾 Datos

Se persisten en `localStorage` bajo la clave `flujo:v1`. La primera vez que abrís la app se cargan datos de ejemplo realistas (sueldo de fin de semana, propinas, alquiler, servicios) para que el producto se sienta vivo de entrada.

## 🗺️ Roadmap (post-MVP)

- Recurrencia ("cada 1° del mes").
- Comparativa mes a mes.
- Export / import JSON.
- Categorías con color y filtros avanzados.
- Múltiples monedas.
- Sync opcional con backend.

## 📄 Documentación

Ver [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) para las decisiones completas de producto, arquitectura y diseño.

---

<div align="center">

Hecho con foco en claridad, estética y control financiero personal.

</div>
