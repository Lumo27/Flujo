import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const fieldClasses =
  'w-full h-11 bg-surface-2 border border-border rounded-xl px-3.5 text-sm text-text placeholder:text-muted focus:border-primary focus:ring-0 outline-none transition-colors';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-expense">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted/80">{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(fieldClasses, className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(fieldClasses, 'appearance-none pr-8', className)} {...rest}>
        {children}
      </select>
    );
  },
);
