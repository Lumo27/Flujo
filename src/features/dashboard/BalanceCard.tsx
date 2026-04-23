import { Wallet, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  balance: number;
}

export function BalanceCard({ balance }: Props) {
  const startingBalance = useTransactionsStore((s) => s.settings.startingBalance);
  const setStartingBalance = useTransactionsStore((s) => s.setStartingBalance);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(startingBalance));

  return (
    <>
      <div className="card relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-[#4F46E5]/10" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <Wallet size={14} /> Saldo actual
            </div>
            <button
              onClick={() => {
                setValue(String(startingBalance));
                setOpen(true);
              }}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-surface-2/80 px-2.5 text-[11px] font-medium text-muted hover:text-text"
            >
              <Pencil size={12} /> Saldo inicial
            </button>
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatCurrency(balance)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Confirmado a hoy · Saldo inicial {formatCurrency(startingBalance)}
          </p>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Saldo inicial">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStartingBalance(Number(value) || 0);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <Field
            label="¿Con cuánta plata arrancás?"
            hint="Es el punto de partida para calcular proyección y peor escenario."
          >
            <Input
              inputMode="numeric"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
