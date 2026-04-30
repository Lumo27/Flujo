# Flujo — Architecture & Developer Guide

> **Version:** 0.1.0 (frontend-only, localStorage)  
> **Stack:** React 18 · TypeScript 5 · Vite 5 · Zustand 4 · Tailwind CSS 3 · Recharts 2  
> **Target:** Freelancers and shift workers in Argentina tracking variable, tip-heavy income month by month.

---

## Table of Contents

1. [What Flujo does — the problem](#1-what-flujo-does--the-problem)
2. [Project structure](#2-project-structure)
3. [Data model](#3-data-model)
4. [State management (Zustand)](#4-state-management-zustand)
5. [Core calculations (`lib/calc.ts`)](#5-core-calculations-libcalcts)
6. [Pages and features](#6-pages-and-features)
7. [UI component system](#7-ui-component-system)
8. [Design tokens and theming](#8-design-tokens-and-theming)
9. [Known quirks and intentional decisions](#9-known-quirks-and-intentional-decisions)
10. [Bugs and tech debt to fix before backend](#10-bugs-and-tech-debt-to-fix-before-backend)
11. [Backend roadmap](#11-backend-roadmap)

---

## 1. What Flujo does — the problem

Most budgeting apps assume a fixed monthly salary. Flujo is built for people whose income is **variable and shift-based** — waiters, freelancers, gig workers — where:

- You work N days/shifts per month, each earning a different amount.
- You know roughly what you *expect* to earn per shift (estimated) and the *worst case* (floor).
- You need to see, day by day, whether your real cumulative income is tracking above or below your goal.

The core insight: instead of one "budget" line, Flujo shows **three lines** on a chart:

| Line | Color | What it means |
|------|-------|---------------|
| **Realidad** | Green | Cumulative confirmed income so far (stops at today) |
| **Estimación** | Violet | Step function — rises by `shiftIncome` on each planned work day |
| **Piso** | Orange (dashed) | Step function — rises by `worstMonthlyIncome ÷ n` on each work day |

The chart answers: *"Am I on track, or am I falling behind?"*

---

## 2. Project structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx        # Shell: sidebar (desktop) + bottom nav (mobile) + global FAB
│   └── ui/
│       ├── Badge.tsx            # Colored chip (tone-based)
│       ├── Button.tsx           # Polymorphic button (variant + size)
│       ├── Card.tsx             # Card + CardHeader (icon, title, subtitle, action)
│       ├── EmptyState.tsx       # Centered empty placeholder with icon
│       ├── Input.tsx            # Input, Select, Field (label + hint + error wrapper)
│       └── Modal.tsx            # Full-screen overlay modal, Escape-key aware, scroll-locked
│
├── data/
│   └── seed.ts                 # Demo data for onboarding / "Volver al demo"
│
├── features/
│   ├── calendar/
│   │   └── MonthCalendar.tsx   # Grid calendar with day selection + multi-delete mode
│   ├── dashboard/
│   │   ├── BalanceCard.tsx     # Large balance display + "Ajustar base" modal
│   │   ├── CashflowChart.tsx   # Recharts AreaChart with the 3-line income projection
│   │   ├── MonthSummary.tsx    # Income / expense tiles with progress bar
│   │   ├── ProjectionCard.tsx  # "A fin de mes" + "Piso del mes" summary cards
│   │   ├── ProjectionSettingsModal.tsx  # Monthly goals + work-day calendar + shift income + blue rate
│   │   └── UpcomingList.tsx    # Next 14 days of pending transactions (capped at 7 shown)
│   ├── settings/
│   │   └── DataToolsCard.tsx   # Export / Import / Clear all data
│   └── transactions/
│       ├── TransactionFormModal.tsx  # Create (multi-date) + Edit (single-date) modal
│       ├── TransactionItem.tsx       # Row: confirm/unconfirm + edit + delete
│       ├── TransactionList.tsx       # Grouped-by-date list with EmptyState
│       └── TypeFilter.tsx            # Pill filter: All | Income | Expense | Pending
│
├── lib/
│   ├── calc.ts     # All financial calculations (pure functions, no side effects)
│   ├── cn.ts       # Minimal classname concatenation helper
│   ├── date.ts     # Date utilities (ISO formatting, calendar grid, monthLabel)
│   ├── format.ts   # Number and date display formatting (ARS, USD, compact)
│   └── id.ts       # Client-side ID generation (crypto.randomUUID with fallback)
│
├── pages/
│   ├── DashboardPage.tsx      # Main view: balance + summary + chart + upcoming
│   ├── TransactionsPage.tsx   # Full transaction list + filters + DataToolsCard
│   ├── CalendarPage.tsx       # Calendar view wrapper
│   └── HowToFlowPage.tsx      # In-app guide: steps + glossary (static content)
│
├── store/
│   └── useTransactionsStore.ts  # Zustand store with persist middleware (localStorage)
│
├── types/
│   └── transaction.ts           # All types + CATEGORY_LABELS + category arrays
│
├── App.tsx      # React Router routes (all nested under AppLayout)
├── main.tsx     # ReactDOM entry, BrowserRouter
└── index.css    # Tailwind base + .card and .chip component classes
```

---

## 3. Data model

### `Transaction`

```ts
interface Transaction {
  id: string;                  // crypto.randomUUID() or timestamp fallback
  type: 'income' | 'expense';
  status: 'pending' | 'confirmed';
  variability: 'fixed' | 'variable';
  category: TransactionCategory;
  title: string;
  note?: string;
  date: string;                // ISO date: 'YYYY-MM-DD'
  currency?: 'ARS' | 'USD';   // defaults to ARS when absent
  estimatedAmount: number;     // always positive, in the transaction's currency
  actualAmount?: number;       // set on confirmation; always positive
  minAmount?: number;          // worst-case per-transaction estimate (set in seed, NOT used in calculations yet)
  createdAt: string;           // ISO datetime
  updatedAt: string;           // ISO datetime
}
```

**Status semantics:**

| status | meaning | counted in balance? |
|--------|---------|-------------------|
| `pending` | Expected but not yet happened | ❌ No |
| `confirmed` | Happened, real amount known | ✅ Yes (`actualAmount ?? estimatedAmount`) |

**Variability semantics:**

| variability | auto-confirmed on create? | confirm button shown? |
|-------------|--------------------------|----------------------|
| `fixed` expense | ✅ Yes | ❌ No |
| `variable` expense | ❌ No | ✅ Yes |
| any income | ❌ No | ✅ Yes |

The rationale: fixed expenses (rent, utilities) are certain amounts that will happen — we auto-confirm them to keep the balance accurate without manual friction. Variable expenses and all income need the user to confirm with the real amount.

### `Settings`

```ts
interface Settings {
  startingBalance: number;           // opening balance for the month (user-set once)
  seeded: boolean;                   // whether onboarding demo data was loaded
  projectionSettings: ProjectionSettings;
  blueRate: number;                  // ARS per 1 USD, for converting USD transactions
}

interface ProjectionSettings {
  estimatedMonthlyIncome: number;    // target income goal for the month
  worstMonthlyIncome: number;        // worst-case total income for the month
  shiftIncome: number;               // income per shift/work day (for chart step lines)
  workDays: string[];                // ISO dates of planned work days (any month)
}
```

**Important:** `projectionSettings.workDays` stores dates across all months. When computing the chart, only work days within the currently viewed month are used. This allows the user to set up future months in advance.

**The two roles of ProjectionSettings:**
- **Summary cards** (`ProjectionCard`): use `estimatedMonthlyIncome` and `worstMonthlyIncome` as flat monthly totals — the user's stated goals.
- **Chart lines**: use `shiftIncome` × workDays to build a step function. If `shiftIncome = 0`, falls back to `estimatedMonthlyIncome ÷ n`. The "Piso" line always uses `worstMonthlyIncome ÷ n`.

### `TransactionDraft`

`Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>` — used for creating transactions. The store adds the missing fields.

---

## 4. State management (Zustand)

**File:** `src/store/useTransactionsStore.ts`  
**Persist key:** `flujo:v1` (localStorage)  
**Current schema version:** 9

### Store shape

```ts
{
  transactions: Transaction[];
  settings: Settings;
  // actions:
  addTransaction(draft)
  addTransactions(drafts)        // bulk create — used when selecting multiple dates
  updateTransaction(id, patch)
  removeTransaction(id)
  confirmTransaction(id, actualAmount)
  unconfirmTransaction(id)
  setStartingBalance(amount)
  setProjectionSettings(partial)
  setBlueRate(rate)
  resetToSeed()                  // loads demo data
  clearAll()                     // wipes transactions, resets settings, preserves blueRate
}
```

### Zustand persist migration — critical notes

The `migrate()` function receives **the raw persisted state object directly**, NOT a `{ state, version }` wrapper. Accessing `_persistedState.state` will always be `undefined`.

```ts
// ✅ Correct
migrate(_persistedState: unknown, fromVersion) {
  const s = _persistedState as { transactions?: ...; settings?: ... };
  return { transactions: s?.transactions ?? [], ... };
}

// ❌ Wrong — common mistake
migrate(_persistedState: unknown, fromVersion) {
  const s = (_persistedState as any).state;  // always undefined!
}
```

### Version history

| Version | Change |
|---------|--------|
| 1–7 | Various field additions |
| 8 | Added `dailyEstimated` / `dailyWorst` (per-day rates approach, later abandoned) |
| 9 | Switched to `estimatedMonthlyIncome` + `worstMonthlyIncome` + `shiftIncome`. Migration carries `dailyEstimated` → `shiftIncome`. |

---

## 5. Core calculations (`lib/calc.ts`)

All functions are **pure** — they take transactions and settings as arguments and return values. No store access, no side effects.

### `currentBalance(transactions, blueRate)`

```
startingBalance + Σ confirmedDelta(t) for all t
```

`confirmedDelta(t)` returns `+actualAmount` (in ARS) for confirmed income, `-actualAmount` for confirmed expenses, and `0` for pending.

USD transactions are multiplied by `blueRate` before adding.

### `monthSummary(transactions, ref, blueRate)`

Returns `{ incomeConfirmed, incomeEstimated, expenseConfirmed, expenseEstimated }` for the given month. Used by `MonthSummary` tiles and their progress bars.

### `projectIncomeByDay(transactions, ref, settings, blueRate)`

Returns an array of `{ date, actual, estimated, worst }` for every day of the month.

- `actual`: running sum of confirmed income up to and including that day. `null` for future dates (so the chart line stops at today).
- `estimated`: cumulative step function. Rises by `shiftIncome` (or `estimatedMonthlyIncome ÷ n` fallback) on each work day. `null` if no work days or no income goal configured.
- `worst`: cumulative step by `worstMonthlyIncome ÷ n` on each work day. `null` if `worstMonthlyIncome = 0`.

Work days are filtered to the current viewed month only.

### `monthIncomeProjection(transactions, ref, settings, blueRate)`

Returns `{ actual, estimated, worst }` as flat monthly totals for the summary cards. `estimated` and `worst` come directly from `settings`, not from transaction data.

### `upcoming(transactions, days = 14)`

Returns pending transactions from today through `today + days`, sorted by date. **Note:** operates on all transactions regardless of which month is being viewed on the dashboard.

---

## 6. Pages and features

### DashboardPage

The main page. Computes everything via `useMemo` from the store and passes down to child components as props. No child component reads from the store directly except `BalanceCard` (which reads `startingBalance` to display it inside the "Ajustar base" modal).

**Month navigation** (`viewMonth` state) is local to `DashboardPage`. Changing months re-runs all `useMemo` calculations with the new `ref`.

Layout (desktop):
```
BalanceCard (full width)
MonthSummary (2 columns: income tile | expense tile)
ProjectionCard (2 columns: estimated | worst)
CashflowChart (60%) | UpcomingList (40%)
```

### TransactionsPage

Shows all transactions with a type/status filter. Filter is local state; the filtered array is a `useMemo` slice of the full `transactions` array.

Transactions are grouped by date in `TransactionList.groupByDate()`, sorted newest-first.

Also hosts `DataToolsCard` (export/import/clear).

### CalendarPage

Wraps `MonthCalendar` and passes the full `transactions` array. The calendar component handles its own month navigation and builds a `Map<date, Transaction[]>` index internally.

**Multi-delete mode:** activating it disables month navigation and shows a selection toolbar. Selecting a day marks all its transactions for deletion. A confirmation modal is required before any deletion.

### HowToFlowPage

Completely static. Two sections: a 4-step guide and a glossary. No store access.

### AppLayout

Handles navigation (desktop sidebar + mobile bottom nav). The "Nuevo movimiento" button (FAB on mobile, sidebar button on desktop) is here, so `TransactionFormModal` lives at the layout level — accessible from any page without re-implementing the button on each page.

---

## 7. UI component system

All shared components are in `src/components/ui/`. They are thin wrappers that apply consistent styling via Tailwind. No third-party component library.

| Component | Key props | Notes |
|-----------|-----------|-------|
| `Button` | `variant`, `size` | `forwardRef`. Variants: primary, secondary, ghost, danger. |
| `Input` | standard HTML input props | `forwardRef`. Uses `fieldClasses` constant. |
| `Select` | standard HTML select props | `forwardRef`. Same style as Input. |
| `Field` | `label`, `hint`, `error`, `children` | Wraps any input in a `<label>` with optional hint/error text. |
| `Modal` | `open`, `onClose`, `title`, `children` | Escape key closes, body scroll locked, backdrop click closes. Slides up from bottom on mobile. |
| `Card` | `className`, `children` | Applies `.card` class (bg-surface + border + rounded-2xl + shadow). |
| `CardHeader` | `title`, `subtitle`, `icon`, `iconTone`, `action` | Standardized card header with icon chip. |
| `Badge` | `tone` | Colored chip. Tones: neutral, income, expense, primary, warning, analytics. |
| `EmptyState` | `icon`, `title`, `description`, `action` | Centered dashed-border placeholder. |

### `cn()` helper

A minimal classname merger in `lib/cn.ts`. Filters falsy values and joins with space. Does **not** handle object syntax or Tailwind class conflict resolution (no `tailwind-merge`). Sufficient for current use.

---

## 8. Design tokens and theming

Defined in `tailwind.config.ts`. Dark-only design (no light mode).

**Color palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0b1220` | Page background |
| `surface` | `#111827` | Card background |
| `surface-2` | `#1a2435` | Input backgrounds, hover states |
| `border` | `#1f2937` | All borders |
| `text` | `#e5e7eb` | Primary text |
| `muted` | `#9ca3af` | Secondary text, labels |
| `primary` | `#3b82f6` | Actions, navigation active state, buttons |
| `analytics` | `#8b5cf6` | **Violet — data/projections only.** Never use for actions or navigation. |
| `income` | `#22c55e` | Income values, confirmed state |
| `expense` | `#ef4444` | Expense values, destructive actions |
| `warning` | `#f59e0b` | Pending state, worst-case scenario |

**Component classes** (in `index.css`):
- `.card` → `bg-surface border border-border rounded-2xl shadow-card`
- `.chip` → `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium`

**Font:** Inter (Google Fonts), with `system-ui` fallback.

**Date/locale:** All dates and numbers are formatted in `es-AR` locale. Capitalization is handled in JS (not CSS) because `text-transform: capitalize` would uppercase every word ("Abril **De** 2026"), while `Intl.DateTimeFormat` can return prepositions lowercase ("de"). The fix: `raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()` — sentence case only.

---

## 9. Known quirks and intentional decisions

### Balance is global, not per-month

`currentBalance()` sums all confirmed transactions across all time, not just the current month. This is intentional — it represents your actual running account balance, not a monthly ledger. `startingBalance` is the one-time opening balance (what you started with before using the app).

### Fixed expenses auto-confirm

When a user creates a `variability: 'fixed'` expense, it's created with `status: 'confirmed'` and `actualAmount = estimatedAmount`. The UI hides the "Confirm" button for these. The rationale: if you know rent is exactly $150,000, there's no reason to make the user confirm it again. Variable items (groceries, tips) need real-amount confirmation.

### `minAmount` field exists but is unused in calculations

`Transaction.minAmount` was intended for per-transaction worst-case estimates (e.g., "tips: estimated $145k, worst case $85k"). It's populated in the seed data but `calc.ts` doesn't use it anywhere — the "Piso" projection line uses `worstMonthlyIncome` from settings instead, distributed equally across work days. This is a design simplification: per-transaction minimum amounts would require a more complex projection engine.

### Work days span multiple months

`projectionSettings.workDays` is a flat array of ISO dates. The system filters them to the viewed month on each render. This means the user can plan work days for future months without any special UI — they just use the calendar in the ProjectionSettings modal and navigate to next month.

### `upcoming()` ignores `viewMonth`

The "Próximos 14 días" list always shows the next 14 days from today, regardless of which month the dashboard is displaying. This is intentional — upcoming is about real near-future awareness, not historical analysis.

### Seed data is date-relative

`buildSeed()` builds all dates relative to the current month, not hardcoded. So the demo always shows a realistic "this month" scenario regardless of when it's loaded.

---

## 10. Bugs and tech debt to fix before backend

These were identified during codebase review and should be addressed before the backend integration:

### 🔴 Bug: `TransactionList.longDate()` doesn't apply sentence-case fix

`TransactionList.tsx` has its own local `longDate()` function that formats dates without the sentence-case normalization:

```ts
// src/features/transactions/TransactionList.tsx (line 51–57)
function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: '2-digit', month: 'long',
  }).format(d);
  // ❌ No sentence-case fix — can output "Martes 29 De Abril" on some browsers
}
```

**Fix:** use `formatDateLong()` from `lib/format.ts` (which already applies the fix), or add the sentence-case normalization here.

### 🔴 Bug: Delete on `TransactionItem` has no confirmation

In `TransactionItem.tsx` (line 99), clicking the trash button immediately calls `removeTransaction(t.id)` with no modal. The calendar's multi-delete correctly shows a confirmation dialog. The single-item delete in the list does not.

**Fix:** add a simple inline confirmation — either a "Are you sure?" modal (like the calendar has) or at minimum a two-click "click to arm, click to confirm" pattern.

### 🟡 Tech debt: `hasProjection` logic is duplicated

`DashboardPage.tsx` (line 38–42) and `calc.ts:projectIncomeByDay()` (line 123–127) both independently check whether projection settings are configured enough to draw chart lines. If the condition ever changes, both need updating.

**Fix:** export a `hasProjectionSettings(settings, ref)` helper from `calc.ts` and use it in both places.

### 🟡 Tech debt: `UpcomingList` silently caps at 7 items

`upcoming()` returns up to 14 days of pending transactions, but `UpcomingList` only renders the first 7 (`.slice(0, 7)`). There's no "show more" or count indicator. If a user has 8+ upcoming transactions, the rest are invisible.

**Fix:** either show all items with a scroll container, or add a "Y N más" footer link to `/movimientos?filter=pending`.

### 🟡 Tech debt: `createId()` is client-only

Currently IDs are `crypto.randomUUID()`. When the backend is introduced, IDs should come from the server (or use a proper UUID v4 library like `uuid` on the frontend to generate offline-friendly IDs that the server can accept). The current fallback (`Date.now().toString(36) + Math.random()`) is not collision-safe.

### 🟢 Minor: `currency` field is optional on `Transaction`

`currency?: Currency` defaults to ARS when absent. Older data without this field works correctly because `toARS()` treats `undefined` as ARS. When the backend lands, the schema should make this non-optional with a default.

---

## 11. Backend roadmap

> This section plans the evolution from localStorage → real backend. The frontend data model and calculations are already solid; the backend is primarily about **persistence, multi-device sync, and eventually multi-user support**.

### Guiding principles

1. **Don't break the frontend calculation model.** `calc.ts` is pure and correct — keep it. The backend stores data; the frontend computes everything.
2. **API-first.** Define the REST API contract before writing code. Frontend and backend can be developed in parallel.
3. **Start simple.** Single user, JWT auth, PostgreSQL. No microservices, no queues, no over-engineering.
4. **Offline-first later.** Phase 1 requires network. Offline sync (optimistic updates, conflict resolution) is Phase 3+.

---

### Tech stack recommendation

| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Node.js 22 LTS | Same language as frontend, large ecosystem |
| Framework | Fastify | Faster than Express, built-in TypeScript, schema validation |
| ORM | Drizzle ORM | Type-safe, no code generation needed, great PostgreSQL support |
| Database | PostgreSQL 16 | JSONB for flexible fields, mature, free |
| Auth | JWT (access + refresh tokens) | Stateless, works well for SPA |
| Validation | Zod | Already familiar pattern; share schemas between FE and BE |
| Hosting | Railway / Render (initially) | Zero-ops, PostgreSQL included |

---

### Database schema

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- bcrypt
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Settings (one row per user)
CREATE TABLE settings (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  starting_balance    INTEGER NOT NULL DEFAULT 0,  -- in ARS cents
  blue_rate           INTEGER NOT NULL DEFAULT 120000, -- ARS per 100 USD (avoid floats)
  projection          JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- projection shape: { estimatedMonthlyIncome, worstMonthlyIncome, shiftIncome, workDays[] }
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  status          TEXT NOT NULL CHECK (status IN ('pending', 'confirmed')),
  variability     TEXT NOT NULL CHECK (variability IN ('fixed', 'variable')),
  category        TEXT NOT NULL,
  title           TEXT NOT NULL,
  note            TEXT,
  date            DATE NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD')),
  estimated_amount INTEGER NOT NULL,  -- always positive, in currency's smallest unit
  actual_amount   INTEGER,            -- set on confirmation
  min_amount      INTEGER,            -- worst-case estimate (optional)
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX transactions_user_date ON transactions(user_id, date);
CREATE INDEX transactions_user_status ON transactions(user_id, status);
```

**Note on amounts:** store as integers (cents/centavos) to avoid floating-point issues. Divide by 100 on the frontend if needed, or keep working with whole pesos (no decimal support currently).

---

### REST API contract

**Base URL:** `/api/v1`

#### Auth

```
POST /auth/register    { email, password } → { user, accessToken, refreshToken }
POST /auth/login       { email, password } → { user, accessToken, refreshToken }
POST /auth/refresh     { refreshToken }    → { accessToken }
POST /auth/logout      {}                  → 204
```

#### Transactions

```
GET    /transactions              ?month=YYYY-MM  → Transaction[]
POST   /transactions              TransactionDraft → Transaction
POST   /transactions/bulk         TransactionDraft[] → Transaction[]  (multi-date create)
GET    /transactions/:id          → Transaction
PATCH  /transactions/:id          Partial<TransactionDraft> → Transaction
DELETE /transactions/:id          → 204
POST   /transactions/:id/confirm  { actualAmount } → Transaction
POST   /transactions/:id/unconfirm → Transaction
```

#### Settings

```
GET   /settings   → Settings
PATCH /settings   Partial<Settings> → Settings
```

#### Data tools

```
GET  /export   → JSON backup (same shape as current localStorage format)
POST /import   JSON backup → 201 (replaces all user data)
```

---

### Migration plan — localStorage → backend

The migration must be **non-breaking**: users with existing localStorage data should be able to import it into their new account.

**Approach:**

1. Add a `VITE_API_URL` env variable. When set, the app uses the API. When absent, it falls back to localStorage (for development without a backend running).
2. Create an `api/` layer in the frontend that mirrors the store's action signatures:
   ```
   src/api/
   ├── transactions.ts   # CRUD + confirm/unconfirm
   ├── settings.ts
   ├── auth.ts
   └── client.ts         # fetch wrapper with auth token injection
   ```
3. Replace store actions one by one to call the API instead of mutating local state.
4. The Zustand store becomes a **cache layer** (React Query or TanStack Query recommended for this phase).
5. On first login, offer to import existing localStorage data via `POST /import`.

---

### Phased implementation

#### Phase 1 — Core backend (estimated: 2–3 days)

**Goal:** all data persisted in PostgreSQL, single user, no auth yet (hardcoded user for testing).

Tasks:
- [ ] Initialize Fastify project with TypeScript
- [ ] Set up Drizzle ORM + PostgreSQL connection
- [ ] Create and run initial migration (schema above)
- [ ] Implement `/transactions` CRUD endpoints
- [ ] Implement `/transactions/bulk` for multi-date create
- [ ] Implement `/transactions/:id/confirm` and `/unconfirm`
- [ ] Implement `/settings` GET + PATCH
- [ ] Add Zod validation on all request bodies
- [ ] Test with Postman / curl

#### Phase 2 — Auth (estimated: 1 day)

**Goal:** JWT-based login, user isolation.

Tasks:
- [ ] `POST /auth/register` and `POST /auth/login`
- [ ] Access token (15 min) + refresh token (30 days)
- [ ] Middleware: verify JWT, attach `req.userId`
- [ ] All routes scoped by `userId`
- [ ] `POST /auth/logout` (invalidate refresh token)
- [ ] `VITE_API_URL` env in frontend, auth flow (login page or modal)

#### Phase 3 — Frontend integration (estimated: 2 days)

**Goal:** frontend talking to the real backend.

Tasks:
- [ ] Add TanStack Query (React Query) for data fetching + caching
- [ ] Create `src/api/` layer
- [ ] Replace `addTransaction` / `updateTransaction` etc. with API calls
- [ ] Replace `useTransactionsStore` reads with `useQuery` hooks
- [ ] Keep `calc.ts` untouched — still pure functions called on fetched data
- [ ] Handle loading states (skeleton placeholders in cards)
- [ ] Handle error states (toast or inline error)
- [ ] Import from localStorage flow (one-time migration for existing users)

#### Phase 4 — Export / Import and polish (estimated: 0.5 day)

Tasks:
- [ ] `GET /export` endpoint (same JSON shape as current localStorage backup)
- [ ] `POST /import` endpoint (validates + replaces all user transactions)
- [ ] Update `DataToolsCard` to call these endpoints instead of reading localStorage

#### Phase 5 — Multi-month intelligence (future)

Ideas that become possible once there's a real backend:
- Monthly snapshots (lock a month's balance at month-end)
- Cross-month balance carry-over tracking
- Income trends and charts across months
- Push notifications for upcoming pending items
- Export to CSV/XLSX

---

### Frontend changes needed for backend (summary)

| Current | New |
|---------|-----|
| Zustand `persist` to localStorage | Zustand as UI cache + TanStack Query for server state |
| `createId()` generates client ID | Server generates UUID, returned in response |
| `window.location.reload()` on import | Call `queryClient.invalidateQueries()` |
| No auth, no routing guards | Auth context + protected routes |
| `STORAGE_KEY` constant | `VITE_API_URL` env + auth token in memory/cookie |

---

*Last updated: 2026-04-30*
