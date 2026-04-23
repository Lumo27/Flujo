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
      transactions: buildSeed(),
      settings: { startingBalance: 0, seeded: true, projectionSettings: DEFAULT_PROJECTION_SETTINGS },

      addTransaction: (draft) =>
        set((state) => {
          const now = new Date().toISOString();
          const t: Transaction = { ...draft, id: createId(), createdAt: now, updatedAt: now };
          return { transactions: [...state.transactions, t] };
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
          settings: { startingBalance: 0, seeded: true, projectionSettings: DEFAULT_PROJECTION_SETTINGS },
        }),

      clearAll: () =>
        set({
          transactions: [],
          settings: { startingBalance: 0, seeded: true, projectionSettings: DEFAULT_PROJECTION_SETTINGS },
        }),
    }),
    {
      name: PERSIST_KEY,
      version: 2,
      migrate(persistedState, fromVersion) {
        // v1 → v2: add projectionSettings default if missing
        const state = persistedState as TransactionsState;
        if (fromVersion < 2) {
          state.settings = {
            ...state.settings,
            projectionSettings: state.settings.projectionSettings ?? DEFAULT_PROJECTION_SETTINGS,
          };
        }
        return state;
      },
    },
  ),
);
