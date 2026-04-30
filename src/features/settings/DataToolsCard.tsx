import { useRef, useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'flujo:v1';

export function DataToolsCard() {
  const clearAll = useTransactionsStore((s) => s.clearAll);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setExportError('No hay datos guardados para exportar. Cargá movimientos primero.');
      return;
    }
    setExportError(null);
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flujo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import ────────────────────────────────────────────────────────────────
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
    setImportError(null);
    setPendingFile(file);
    setConfirmImport(true);
  }

  function executeImport() {
    if (!pendingFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (!json.state?.transactions) throw new Error('Formato inválido');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
        window.location.reload();
      } catch {
        setImportError('El archivo no es un backup válido de Flujo.');
        setConfirmImport(false);
        setPendingFile(null);
      }
    };
    reader.readAsText(pendingFile);
  }

  // ── Clear ─────────────────────────────────────────────────────────────────
  function executeClear() {
    clearAll();
    setConfirmClear(false);
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface-1 p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Datos</p>
        <h2 className="mt-1 text-base font-semibold text-text">Herramientas</h2>
        <p className="mt-0.5 text-xs text-muted">
          Exportá un backup, importá uno anterior, o resetéá el mes a cero.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-income/40 hover:bg-income-soft hover:text-income"
          >
            <Download size={13} />
            Exportar backup
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
          >
            <Upload size={13} />
            Importar backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileSelected}
          />

          {/* Clear */}
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-expense/40 hover:bg-expense-soft hover:text-expense"
          >
            <Trash2 size={13} />
            Vaciar datos
          </button>
        </div>

        {exportError && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <AlertTriangle size={12} /> {exportError}
          </p>
        )}
        {importError && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-expense">
            <AlertTriangle size={12} /> {importError}
          </p>
        )}
      </div>

      {/* Modal — confirmar importar */}
      <Modal open={confirmImport} onClose={() => { setConfirmImport(false); setPendingFile(null); }} title="Importar backup">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Esto va a <span className="font-medium text-text">reemplazar todos tus datos actuales</span> con
            el contenido de <span className="font-medium text-text">{pendingFile?.name}</span>. La página
            se va a recargar.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setConfirmImport(false); setPendingFile(null); }}>
              Cancelar
            </Button>
            <Button onClick={executeImport}>Importar y recargar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal — confirmar vaciar */}
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Vaciar datos">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Esto va a eliminar <span className="font-medium text-expense">todos los movimientos</span> de
            todos los meses y resetear el saldo y las proyecciones a cero.
            <br /><br />
            <span className="font-medium text-text">Esta acción no se puede deshacer.</span> Exportá un backup
            primero si querés guardar los datos.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancelar
            </Button>
            <Button
              onClick={executeClear}
              className="bg-expense text-white shadow-none hover:bg-expense/90"
            >
              Vaciar todo
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
