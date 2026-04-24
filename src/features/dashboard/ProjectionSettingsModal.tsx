import { useEffect, useState } from 'react';
import { addMonths, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { formatCurrency } from '@/lib/format';
import { calendarGrid, monthLabel, todayISO, toISO } from '@/lib/date';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function ProjectionSettingsModal({ open, onClose }: Props) {
  const stored = useTransactionsStore((s) => s.settings.projectionSettings);
  const setProjectionSettings = useTransactionsStore((s) => s.setProjectionSettings);

  const [estimated, setEstimated] = useState('');
  const [worst, setWorst] = useState('');
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [calMonth, setCalMonth] = useState(new Date());

  useEffect(() => {
    if (!open) return;
    setEstimated(stored.estimatedMonthlyIncome ? String(stored.estimatedMonthlyIncome) : '');
    setWorst(stored.worstMonthlyIncome ? String(stored.worstMonthlyIncome) : '');
    setWorkDays(stored.workDays ?? []);
    setCalMonth(new Date());
  }, [open, stored]);

  function toggleDay(iso: string) {
    setWorkDays((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso].sort(),
    );
  }

  const handleSave = () => {
    setProjectionSettings({
      estimatedMonthlyIncome: parseFloat(estimated) || 0,
      worstMonthlyIncome: parseFloat(worst) || 0,
      workDays,
    });
    onClose();
  };

  const estNum = parseFloat(estimated) || 0;
  const worstNum = parseFloat(worst) || 0;
  const n = workDays.filter((d) => isSameMonth(new Date(d + 'T00:00:00'), calMonth)).length;
  const totalWorkDays = workDays.length;

  const calDays = calendarGrid(calMonth);

  return (
    <Modal open={open} onClose={onClose} title="Metas del mes">
      <p className="mb-4 text-sm text-muted">
        Definí cuánto esperás ganar en cada escenario y marcá los días que vas a trabajar.
        Esos montos se van a distribuir equitativamente entre tus días de trabajo.
      </p>

      {/* Montos */}
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup
          label="Estimación"
          hint="Meta normal del mes"
          value={estimated}
          onChange={setEstimated}
          placeholder="1200000"
          accent="analytics"
        />
        <FieldGroup
          label="Piso del mes"
          hint="Peor escenario posible"
          value={worst}
          onChange={setWorst}
          placeholder="800000"
          accent="warning"
        />
      </div>

      {/* Calendario de días de trabajo */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-text">Días que vas a trabajar</span>
          <span className="text-[11px] text-muted">
            {totalWorkDays === 0
              ? 'Ningún día seleccionado'
              : `${totalWorkDays} día${totalWorkDays !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface-2/50 p-2">
          {/* Navegación de mes */}
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setCalMonth(addMonths(calMonth, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold capitalize text-text">
              {monthLabel(calMonth)}
            </span>
            <button
              type="button"
              onClick={() => setCalMonth(addMonths(calMonth, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Header días */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="text-[10px] font-medium text-muted">{d}</span>
            ))}
          </div>

          {/* Grilla */}
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((d) => {
              const iso = toISO(d);
              const inMonth = isSameMonth(d, calMonth);
              const sel = workDays.includes(iso);
              const today = isToday(d);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => toggleDay(iso)}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    !inMonth && 'opacity-0 pointer-events-none',
                    inMonth && sel && 'bg-analytics text-white',
                    inMonth && !sel && today && 'border border-analytics text-analytics hover:bg-analytics/10',
                    inMonth && !sel && !today && 'text-muted hover:bg-surface-2 hover:text-text',
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {n > 0 && (estNum > 0 || worstNum > 0) && (
          <p className="mt-1.5 text-[11px] text-muted">
            {n} día{n !== 1 ? 's' : ''} en este mes
            {estNum > 0 && (
              <> · <span className="text-analytics">{formatCurrency(Math.round(estNum / n))}/día est.</span></>
            )}
            {worstNum > 0 && (
              <> · <span className="text-warning">{formatCurrency(Math.round(worstNum / n))}/día piso</span></>
            )}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_4px_12px_-4px_rgba(59,130,246,0.5)] transition-colors hover:bg-primary-hover"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

function FieldGroup({
  label, hint, value, onChange, placeholder, accent,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  accent: 'analytics' | 'warning';
}) {
  const focusRing = accent === 'warning'
    ? 'focus:border-warning focus:ring-warning/20'
    : 'focus:border-primary focus:ring-primary/20';
  const labelColor = accent === 'warning' ? 'text-warning' : 'text-analytics';

  return (
    <div>
      <label className={`block text-sm font-medium ${labelColor}`}>{label}</label>
      <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-7 pr-3 text-sm text-text transition focus:outline-none focus:ring-2 ${focusRing}`}
        />
      </div>
    </div>
  );
}
