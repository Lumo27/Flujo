import { FormEvent, useEffect, useState } from 'react';
import { addMonths, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import {
  CATEGORY_LABELS,
  Currency,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionCategory,
  TransactionType,
  Variability,
} from '@/types/transaction';
import { calendarGrid, monthLabel, todayISO, toISO } from '@/lib/date';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Si se pasa, el modal entra en modo edición pre-llenado. */
  transaction?: Transaction;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function TransactionFormModal({ open, onClose, transaction }: Props) {
  const addTransactions = useTransactionsStore((s) => s.addTransactions);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);

  const isEdit = Boolean(transaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [variability, setVariability] = useState<Variability>('fixed');
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // — Creación: múltiples fechas seleccionadas (vacío hasta que el usuario elija)
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // — Edición: fecha única
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (transaction) {
      setType(transaction.type);
      setTitle(transaction.title);
      setAmount(String(transaction.estimatedAmount));
      setCurrency(transaction.currency ?? 'ARS');
      setVariability(transaction.variability);
      setCategory(transaction.category);
      setDate(transaction.date);
      setNote(transaction.note ?? '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCurrency('ARS');
      setVariability('fixed');
      setCategory('other');
      setNote('');
      setSelectedDates([]);
      setCalendarMonth(new Date());
    }
  }, [open, transaction]);

  useEffect(() => {
    if (isEdit) return;
    const pool = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!pool.includes(category)) setCategory(pool[0]);
  }, [type, category, isEdit]);

  function toggleDate(iso: string) {
    setSelectedDates((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso].sort(),
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!title.trim()) return setError('Poné un nombre al movimiento.');
    if (!Number.isFinite(num) || num <= 0) return setError('El monto tiene que ser mayor a 0.');
    if (!isEdit && selectedDates.length === 0) return setError('Seleccioná al menos un día.');

    if (isEdit && transaction) {
      updateTransaction(transaction.id, {
        type,
        currency,
        variability,
        category,
        title: title.trim(),
        note: note.trim() || undefined,
        date,
        estimatedAmount: num,
      });
    } else {
      const isFixedExpense = type === 'expense' && variability === 'fixed';
      addTransactions(
        selectedDates.map((d) => ({
          type,
          currency,
          status: isFixedExpense ? ('confirmed' as const) : ('pending' as const),
          actualAmount: isFixedExpense ? num : undefined,
          variability,
          category,
          title: title.trim(),
          note: note.trim() || undefined,
          date: d,
          estimatedAmount: num,
        })),
      );
    }
    onClose();
  }

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const calDays = calendarGrid(calendarMonth);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar movimiento' : 'Nuevo movimiento'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => !isEdit && setType('expense')}
            disabled={isEdit}
            className={`h-9 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              type === 'expense'
                ? 'bg-expense text-white'
                : 'text-muted hover:text-text disabled:hover:text-muted'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => !isEdit && setType('income')}
            disabled={isEdit}
            className={`h-9 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              type === 'income'
                ? 'bg-income text-white'
                : 'text-muted hover:text-text disabled:hover:text-muted'
            }`}
          >
            Ingreso
          </button>
        </div>

        <Field label="Nombre">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'income' ? 'Ej: Turno sábado' : 'Ej: Alquiler'}
            autoFocus
          />
        </Field>

        <div className={isEdit ? 'grid grid-cols-2 gap-3' : ''}>
          <Field label="Monto estimado">
            <div className="flex gap-2">
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="0"
                className="flex-1"
              />
              {/* Currency toggle */}
              <div className="flex shrink-0 overflow-hidden rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setCurrency('ARS')}
                  className={`px-3 py-2 text-xs font-semibold transition-colors ${
                    currency === 'ARS'
                      ? 'bg-primary text-white'
                      : 'bg-surface-2 text-muted hover:text-text'
                  }`}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-2 text-xs font-semibold transition-colors ${
                    currency === 'USD'
                      ? 'bg-income text-white'
                      : 'bg-surface-2 text-muted hover:text-text'
                  }`}
                >
                  U$S
                </button>
              </div>
            </div>
          </Field>

          {/* Edición: fecha única */}
          {isEdit && (
            <Field label="Fecha">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          )}
        </div>

        {/* Creación: selector de múltiples fechas */}
        {!isEdit && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-text">
                Días <span className="text-expense">*</span>
              </span>
              <span className="text-[11px] text-muted">
                {selectedDates.length === 0
                  ? 'Ningún día seleccionado'
                  : selectedDates.length === 1
                    ? '1 día seleccionado'
                    : `${selectedDates.length} días seleccionados`}
              </span>
            </div>

            {/* Navegación de mes */}
            <div className="rounded-xl border border-border bg-surface-2/50 p-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-semibold text-text">
                  {monthLabel(calendarMonth)}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Cabecera de días de la semana */}
              <div className="mb-1 grid grid-cols-7 text-center">
                {WEEKDAYS.map((d, i) => (
                  <span key={i} className="text-[10px] font-medium text-muted">
                    {d}
                  </span>
                ))}
              </div>

              {/* Grilla de días */}
              <div className="grid grid-cols-7 gap-0.5">
                {calDays.map((d) => {
                  const iso = toISO(d);
                  const inMonth = isSameMonth(d, calendarMonth);
                  const sel = selectedDates.includes(iso);
                  const today = isToday(d);

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!inMonth}
                      onClick={() => toggleDate(iso)}
                      className={cn(
                        'flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition-colors',
                        !inMonth && 'opacity-0 pointer-events-none',
                        inMonth && sel && 'bg-primary text-white',
                        inMonth && !sel && today && 'border border-primary text-primary hover:bg-primary-soft',
                        inMonth && !sel && !today && 'text-muted hover:bg-surface-2 hover:text-text',
                      )}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Variabilidad">
            <Select
              value={variability}
              onChange={(e) => setVariability(e.target.value as Variability)}
            >
              <option value="fixed">Fijo</option>
              <option value="variable">Variable</option>
            </Select>
          </Field>
        </div>

        <Field label="Nota (opcional)">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Detalle" />
        </Field>

        {error && <p className="text-sm text-expense">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!isEdit && selectedDates.length === 0}>
            {isEdit
              ? 'Guardar cambios'
              : selectedDates.length === 0
                ? 'Seleccioná un día'
                : selectedDates.length === 1
                  ? 'Guardar'
                  : `Guardar ${selectedDates.length} movimientos`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
