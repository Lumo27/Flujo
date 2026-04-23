import { ArrowDownLeft, ArrowUpRight, Check, Trash2, Undo2 } from 'lucide-react';
import { Transaction, CATEGORY_LABELS } from '@/types/transaction';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export function TransactionItem({ t }: { t: Transaction }) {
  const confirmTransaction = useTransactionsStore((s) => s.confirmTransaction);
  const unconfirmTransaction = useTransactionsStore((s) => s.unconfirmTransaction);
  const removeTransaction = useTransactionsStore((s) => s.removeTransaction);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actual, setActual] = useState(String(t.estimatedAmount));

  const isIncome = t.type === 'income';
  const amount = t.status === 'confirmed' ? (t.actualAmount ?? t.estimatedAmount) : t.estimatedAmount;
  const delta =
    t.status === 'confirmed' && t.actualAmount != null ? t.actualAmount - t.estimatedAmount : 0;

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:bg-surface-2 hover:border-border">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isIncome ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense'
          }`}
        >
          {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-text">{t.title}</p>
            {t.status === 'pending' && <Badge tone="warning">Pendiente</Badge>}
            {t.variability === 'variable' && <Badge tone="primary">Variable</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {formatDateShort(t.date)} · {CATEGORY_LABELS[t.category]}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <span className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? '+' : '−'}
            {formatCurrency(amount)}
          </span>
          {delta !== 0 && (
            <span className={`text-[11px] ${delta > 0 ? 'text-income' : 'text-expense'}`}>
              {delta > 0 ? '+' : ''}
              {formatCurrency(delta, { sign: true })} vs est.
            </span>
          )}
        </div>

        <div className="ml-1 flex items-center gap-1">
          {t.status === 'pending' ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-income"
              aria-label="Confirmar"
              title="Confirmar con monto real"
            >
              <Check size={16} />
            </button>
          ) : (
            <button
              onClick={() => unconfirmTransaction(t.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
              aria-label="Deshacer confirmación"
              title="Deshacer"
            >
              <Undo2 size={16} />
            </button>
          )}
          <button
            onClick={() => removeTransaction(t.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-expense"
            aria-label="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirmar: ${t.title}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(actual);
            if (!Number.isFinite(n) || n < 0) return;
            confirmTransaction(t.id, n);
            setConfirmOpen(false);
          }}
          className="space-y-4"
        >
          <Field label="Monto real" hint={`Estimado: ${formatCurrency(t.estimatedAmount)}`}>
            <Input
              inputMode="numeric"
              autoFocus
              value={actual}
              onChange={(e) => setActual(e.target.value.replace(/[^\d]/g, ''))}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
