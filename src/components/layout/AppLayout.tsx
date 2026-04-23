import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, CalendarDays, Plus, Compass } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useState } from 'react';
import { TransactionFormModal } from '@/features/transactions/TransactionFormModal';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/movimientos', label: 'Movimientos', icon: ListOrdered },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/como-fluir', label: 'Cómo Fluir', icon: Compass },
];

export function AppLayout() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border bg-surface/50 px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Brand />
        <nav className="mt-8 flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setFormOpen(true)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)] hover:bg-primary-hover transition-colors"
        >
          <Plus size={15} /> Nuevo movimiento
        </button>

        <p className="mt-auto text-[11px] leading-relaxed text-muted/60">
          Flujo — controlá tu mes antes de que pase.
        </p>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
          <button
            onClick={() => setFormOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)] transition-colors hover:bg-primary-hover"
            aria-label="Nuevo movimiento"
          >
            <Plus size={17} />
          </button>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-4">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted',
                  )
                }
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>

      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] shadow-[0_4px_12px_-4px_rgba(59,130,246,0.7)]">
        <svg viewBox="0 0 64 64" width="18" height="18" fill="none">
          <path d="M14 46c8-2 13-8 18-16s10-13 18-16" stroke="white" strokeWidth="6" strokeLinecap="round"/>
          <circle cx="14" cy="46" r="4" fill="white"/>
          <circle cx="50" cy="14" r="4" fill="white"/>
        </svg>
      </div>
      <span className="text-base font-semibold tracking-tight text-text">Flujo</span>
    </div>
  );
}
