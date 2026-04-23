import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { DEFAULT_PROJECTION_SETTINGS } from '@/lib/calc';
import { formatCurrency } from '@/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProjectionSettingsModal({ open, onClose }: Props) {
  const stored = useTransactionsStore((s) => s.settings.projectionSettings);
  const setProjectionSettings = useTransactionsStore((s) => s.setProjectionSettings);

  const [salary, setSalary] = useState(String(stored.salaryAmount));
  const [tipsEst, setTipsEst] = useState(String(stored.tipsEstimated));
  const [tipsWorst, setTipsWorst] = useState(String(stored.tipsWorst));

  // Re-sync local state each time the modal opens
  useEffect(() => {
    if (open) {
      setSalary(String(stored.salaryAmount));
      setTipsEst(String(stored.tipsEstimated));
      setTipsWorst(String(stored.tipsWorst));
    }
  }, [open, stored.salaryAmount, stored.tipsEstimated, stored.tipsWorst]);

  const handleSave = () => {
    setProjectionSettings({
      salaryAmount: parseFloat(salary) || 0,
      tipsEstimated: parseFloat(tipsEst) || 0,
      tipsWorst: parseFloat(tipsWorst) || 0,
    });
    onClose();
  };

  const handleReset = () => {
    setSalary(String(DEFAULT_PROJECTION_SETTINGS.salaryAmount));
    setTipsEst(String(DEFAULT_PROJECTION_SETTINGS.tipsEstimated));
    setTipsWorst(String(DEFAULT_PROJECTION_SETTINGS.tipsWorst));
  };

  const previewEst = (parseFloat(salary) || 0) + (parseFloat(tipsEst) || 0);
  const previewWorst = (parseFloat(salary) || 0) + (parseFloat(tipsWorst) || 0);

  return (
    <Modal open={open} onClose={onClose} title="Parámetros de proyección">
      <p className="mb-5 text-sm text-muted">
        Estos valores se usan para proyectar las líneas de{' '}
        <span className="font-medium text-analytics">Estimación</span> y{' '}
        <span className="font-medium text-warning">Piso</span> en transacciones pendientes
        de sueldo y propinas.
      </p>

      <div className="space-y-4">
        <FieldGroup
          label="Sueldo por turno"
          hint="Monto fijo que ganás por cada turno de trabajo"
          value={salary}
          onChange={setSalary}
          placeholder="45000"
        />
        <FieldGroup
          label="Propinas — Estimación"
          hint="Monto promedio esperado de propinas por turno"
          value={tipsEst}
          onChange={setTipsEst}
          placeholder="100000"
        />
        <FieldGroup
          label="Propinas — Piso"
          hint="Mínimo garantizado de propinas (peor escenario)"
          value={tipsWorst}
          onChange={setTipsWorst}
          placeholder="70000"
          accent="warning"
        />
      </div>

      {/* Preview */}
      <div className="mt-5 rounded-xl border border-border bg-surface-2/50 p-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
          Vista previa — ingreso total por turno
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted">Estimación</p>
            <p className="font-semibold text-analytics">{formatCurrency(previewEst)}</p>
          </div>
          <div>
            <p className="text-muted">Piso</p>
            <p className="font-semibold text-warning">{formatCurrency(previewWorst)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleReset}
          className="text-xs text-muted transition-colors hover:text-text"
        >
          Valores por defecto
        </button>
        <div className="ml-auto flex gap-2">
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
      </div>
    </Modal>
  );
}

function FieldGroup({
  label,
  hint,
  value,
  onChange,
  placeholder,
  accent = 'default',
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  accent?: 'warning' | 'default';
}) {
  const focusRing =
    accent === 'warning'
      ? 'focus:border-warning focus:ring-warning/20'
      : 'focus:border-primary focus:ring-primary/20';

  return (
    <div>
      <label className="block text-sm font-medium text-text">
        {label}
        {accent === 'warning' && (
          <span className="ml-1.5 text-[11px] font-normal text-warning">(piso)</span>
        )}
      </label>
      <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          $
        </span>
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
