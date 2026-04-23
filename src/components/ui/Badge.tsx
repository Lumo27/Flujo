import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'income' | 'expense' | 'primary' | 'warning' | 'analytics';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted border border-border',
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
  primary: 'bg-primary-soft text-primary',
  warning: 'bg-[rgba(245,158,11,0.12)] text-warning',
  analytics: 'bg-analytics-soft text-analytics',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn('chip', tones[tone], className)}>{children}</span>;
}
