import { FormEvent, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionCategory,
  TransactionType,
  Variability,
} from '@/types/transaction';
import { todayISO } from '@/lib/date';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Si se pasa, el modal entra en modo edición pre-llenado. */
  transaction?: Transaction;
}

export function TransactionFormModal({ open, onClose, transaction }: Props) {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);

  const isEdit = Boolean(transaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [variability, setVariability] = useState<Variability>('fixed');
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Al abrir: si es edición carga los datos existentes, si es creación resetea.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (transaction) {
      setType(transaction.type);
      setTitle(transaction.title);
      setAmount(String(transaction.estimatedAmount));
      setMinAmount(transaction.minAmount ? String(transaction.minAmount) : '');
      setVariability(transaction.variability);
      setCategory(transaction.category);
      setDate(transaction.date);
      setNote(transaction.note ?? '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setMinAmount('');
      setVariability('fixed');
      setCategory('other');
      setDate(todayISO());
      setNote('');
    }
  }, [open, transaction]);

  // Mantener categoría válida al cambiar tipo (solo en creación)
  useEffect(() => {
    if (isEdit) return;
    const pool = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!pool.includes(category)) setCategory(pool[0]);
  }, [type, category, isEdit]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!title.trim()) return setError('Poné un nombre al movimiento.');
    if (!Number.isFinite(num) || num <= 0) return setError('El monto tiene que ser mayor a 0.');

    const min =
      variability === 'variable' && type === 'income' && minAmount
        ? Number(minAmount) || undefined
        : undefined;

    if (isEdit && transaction) {
      updateTransaction(transaction.id, {
        type,
        variability,
        category,
        title: title.trim(),
        note: note.trim() || undefined,
        date,
        estimatedAmount: num,
        minAmount: min,
      });
    } else {
      addTransaction({
        type,
        status: 'pending',
        variability,
        category,
        title: title.trim(),
        note: note.trim() || undefined,
        date,
        estimatedAmount: num,
        minAmount: min,
      });
    }
    onClose();
  }

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar movimiento' : 'Nuevo movimiento'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Selector tipo — bloqueado en edición para no cambiar la semántica del movimiento */}
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Monto estimado">
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
            />
          </Field>
          <Field label="Fecha">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

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

        {variability === 'variable' && type === 'income' && (
          <Field
            label="Piso conservador (peor escenario)"
            hint="Se usa para calcular tu saldo mínimo proyectado."
          >
            <Input
              inputMode="numeric"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
            />
          </Field>
        )}

        <Field label="Nota (opcional)">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Detalle" />
        </Field>

        {error && <p className="text-sm text-expense">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{isEdit ? 'Guardar cambios' : 'Guardar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
