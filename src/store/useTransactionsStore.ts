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
  /** Global income parameters used for projection lines. */
  projectionSettings: ProjectionSettings;
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

      resetToSeed: () =>
        set({
          transactions: buildSeed(),
          settings: {
            startingBalance: 40_000,
            seeded: true,
            projectionSettings: { salaryAmount: 45_000, tipsEstimated: 145_000, tipsWorst: 85_000 },
          },
        }),

      clearAll: () =>
        set({
          transactions: [],
          settings: {
            startingBalance: 0,
            seeded: true,
            projectionSettings: DEFAULT_PROJECTION_SETTINGS,
          },
        }),
    }),
    {
      name: PERSIST_KEY,
      version: 4,
      migrate(_persistedState, fromVersion) {
        if (fromVersion < 4) {
          return {
            transactions: [],
            settings: {
              startingBalance: 0,
              seeded: false,
              projectionSettings: DEFAULT_PROJECTION_SETTINGS,
            },
          };
        }
        return _persistedState as TransactionsState;
      },
    },
  ),
);
