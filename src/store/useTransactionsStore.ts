import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, TransactionDraft } from '@/types/transaction';
import { createId } from '@/lib/id';
import { buildSeed } from '@/data/seed';
import { ProjectionSettings, DEFAULT_PROJECTION_SETTINGS } from '@/lib/calc';

interface Settings {
  /** Manual opening balance the user sets once. */
  startingBalance: number;
  /** Whether the user has completed the initial seed / onboarding. */
  seeded: boolean;
  /** Two numbers: expected income and worst-case income for the month. */
  projectionSettings: ProjectionSettings;
  /** ARS per 1 USD (blue dollar rate). Used to convert USD transactions. */
  blueRate: number;
}

interface TransactionsState {
  transactions: Transaction[];
  settings: Settings;
  // actions
  addTransaction: (draft: TransactionDraft) => void;
  addTransactions: (drafts: TransactionDraft[]) => void;
  updateTransaction: (id: string, patch: Partial<TransactionDraft>) => void;
  removeTransaction: (id: string) => void;
  confirmTransaction: (id: string, actualAmount: number) => void;
  unconfirmTransaction: (id: string) => void;
  setStartingBalance: (amount: number) => void;
  setProjectionSettings: (ps: Partial<ProjectionSettings>) => void;
  setBlueRate: (rate: number) => void;
  resetToSeed: () => void;
  clearAll: () => void;
}

const PERSIST_KEY = 'flujo:v1';

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],
      settings: {
        startingBalance: 0,
        seeded: false,
        projectionSettings: DEFAULT_PROJECTION_SETTINGS,
        blueRate: 1200,
      },

      addTransaction: (draft) =>
        set((state) => {
          const now = new Date().toISOString();
          const t: Transaction = { ...draft, id: createId(), createdAt: now, updatedAt: now };
          return { transactions: [...state.transactions, t] };
        }),

      addTransactions: (drafts) =>
        set((state) => {
          const now = new Date().toISOString();
          const newOnes = drafts.map((d) => ({
            ...d,
            id: createId(),
            createdAt: now,
            updatedAt: now,
          }));
          return { transactions: [...state.transactions, ...newOnes] };
        }),

      updateTransaction: (id, patch) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
          ),
        })),

      removeTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

      confirmTransaction: (id, actualAmount) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, status: 'confirmed', actualAmount, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      unconfirmTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, status: 'pending', actualAmount: undefined, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      setStartingBalance: (amount) =>
        set((state) => ({ settings: { ...state.settings, startingBalance: amount } })),

      setProjectionSettings: (ps) =>
        set((state) => ({
          settings: {
            ...state.settings,
            projectionSettings: { ...state.settings.projectionSettings, ...ps },
          },
        })),

      setBlueRate: (rate) =>
        set((state) => ({ settings: { ...state.settings, blueRate: rate } })),

      resetToSeed: () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const day = (n: number) => {
          const d = new Date(y, m, n);
          return `${y}-${String(m + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        set({
          transactions: buildSeed(),
          settings: {
            startingBalance: 40_000,
            seeded: true,
            blueRate: 1200,
            projectionSettings: {
              estimatedMonthlyIncome: 1_520_000,
              worstMonthlyIncome: 1_040_000,
              shiftIncome: 190_000,
              workDays: [day(5), day(6), day(12), day(13), day(19), day(20), day(24), day(25)],
            },
          },
        });
      },

      clearAll: () =>
        set((state) => ({
          transactions: [],
          settings: {
            startingBalance: 0,
            seeded: true,
            blueRate: state.settings.blueRate, // preserve configured rate
            projectionSettings: DEFAULT_PROJECTION_SETTINGS,
          },
        })),
    }),
    {
      name: PERSIST_KEY,
      version: 9,
      migrate(_persistedState: unknown, fromVersion) {
        if (fromVersion < 9) {
          // Zustand passes the raw state object directly (not the { state, version } wrapper).
          // Preserve transactions, balance, blueRate and workDays across all migrations.
          // v8 had dailyEstimated/dailyWorst — carry dailyEstimated over as shiftIncome.
          const s = _persistedState as {
            transactions?: Transaction[];
            settings?: {
              startingBalance?: number;
              seeded?: boolean;
              blueRate?: number;
              projectionSettings?: {
                estimatedMonthlyIncome?: number;
                worstMonthlyIncome?: number;
                dailyEstimated?: number;
                dailyWorst?: number;
                workDays?: string[];
              };
            };
          };
          const ps = s?.settings?.projectionSettings;
          return {
            transactions: s?.transactions ?? [],
            settings: {
              startingBalance: s?.settings?.startingBalance ?? 0,
              seeded: s?.settings?.seeded ?? false,
              blueRate: s?.settings?.blueRate ?? 1200,
              projectionSettings: {
                estimatedMonthlyIncome: ps?.estimatedMonthlyIncome ?? 0,
                worstMonthlyIncome: ps?.worstMonthlyIncome ?? 0,
                // carry dailyEstimated (v8) over as shiftIncome
                shiftIncome: ps?.dailyEstimated ?? 0,
                workDays: ps?.workDays ?? [],
              },
            },
          };
        }
        return _persistedState as TransactionsState;
      },
    },
  ),
);
