import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, CalendarDays, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useState } from 'react';
import { TransactionFormModal } from '@/features/transactions/TransactionFormModal';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/movimientos', label: 'Movimientos', icon: ListOrdered },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
];

export function AppLayout() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border bg-surface/60 px-4 py-6 lg:sticky lg:top-0 lg:block lg:h-screen">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setFormOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_6px_20px_-8px_rgba(124,92,255,0.7)] hover:bg-primary-hover"
        >
          <Plus size={16} /> Nuevo movimiento
        </button>

        <p className="mt-auto pt-10 text-[11px] leading-relaxed text-muted/70">
          Flujo — proyectá, controlá y anticipá tu mes.
        </p>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
          <button
            onClick={() => setFormOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_20px_-8px_rgba(124,92,255,0.7)]"
            aria-label="Nuevo movimiento"
          >
            <Plus size={18} />
          </button>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-3">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted',
                  )
                }
              >
                <Icon size={20} />
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
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#4F46E5] shadow-[0_8px_24px_-8px_rgba(124,92,255,0.8)]">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 18c3-1 5-3 7-6s4-5 7-6" />
          <circle cx="4" cy="18" r="1.6" fill="white" />
          <circle cx="18" cy="6" r="1.6" fill="white" />
        </svg>
      </div>
      <span className="text-base font-semibold tracking-tight">Flujo</span>
    </div>
  );
}
