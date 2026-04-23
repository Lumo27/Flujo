import { Pencil } from 'lucide-react';
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

  const isPositive = balance >= 0;

  return (
    <>
      <div className="card relative overflow-hidden p-6 sm:p-8 shadow-card-lg">
        {/* Ambient glow — muy sutil, no agresivo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Saldo disponible
              </p>
              <p
                className={`mt-2 text-5xl font-semibold tracking-tight sm:text-6xl ${
                  isPositive ? 'text-text' : 'text-expense'
                }`}
              >
                {formatCurrency(balance)}
              </p>
              <p className="mt-2 text-sm text-muted">
                Base <span className="text-text/80 font-medium">{formatCurrency(startingBalance)}</span>
                {' '}+ movimientos confirmados
              </p>
            </div>

            <button
              onClick={() => {
                setValue(String(startingBalance));
                setOpen(true);
              }}
              className="shrink-0 flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 text-[11px] font-medium text-muted transition-colors hover:bg-border hover:text-text"
            >
              <Pencil size={11} /> Ajustar base
            </button>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Saldo base">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStartingBalance(Number(value) || 0);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <Field
            label="¿Con cuánto arrancás el mes?"
            hint="Punto de partida para proyección y peor escenario."
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
