export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'pending' | 'confirmed';

export type Variability = 'fixed' | 'variable';

export type TransactionCategory =
  | 'salary'
  | 'tips'
  | 'freelance'
  | 'gift'
  | 'rent'
  | 'utilities'
  | 'groceries'
  | 'transport'
  | 'subscriptions'
  | 'entertainment'
  | 'health'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  variability: Variability;
  category: TransactionCategory;
  title: string;
  note?: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Expected amount in ARS. Always positive. */
  estimatedAmount: number;
  /** Realised amount once confirmed. Always positive. */
  actualAmount?: number;
  /** For variable items, the conservative (worst-case) estimate. */
  minAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionDraft = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: 'Sueldo',
  tips: 'Propinas',
  freelance: 'Freelance',
  gift: 'Regalo',
  rent: 'Alquiler',
  utilities: 'Servicios',
  groceries: 'Supermercado',
  transport: 'Transporte',
  subscriptions: 'Suscripciones',
  entertainment: 'Ocio',
  health: 'Salud',
  other: 'Otros',
};

export const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'tips', 'freelance', 'gift', 'other'];
export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'rent',
  'utilities',
  'groceries',
  'transport',
  'subscriptions',
  'entertainment',
  'health',
  'other',
];
