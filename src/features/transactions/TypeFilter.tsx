import { cn } from '@/lib/cn';

export type FilterValue = 'all' | 'income' | 'expense' | 'pending';

const options: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'pending', label: 'Pendientes' },
];

export function TypeFilter({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  return (
    <div className="flex w-full overflow-x-auto rounded-xl border border-border bg-surface-2 p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none',
            value === o.value ? 'bg-primary text-white' : 'text-muted hover:text-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
