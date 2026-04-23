import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('card p-5 md:p-6', className)} {...rest}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  /** Tono del ícono. 'primary' = azul (acción), 'analytics' = violeta (datos/proyección). */
  iconTone?: 'primary' | 'analytics';
}

export function CardHeader({ title, subtitle, action, icon, iconTone = 'primary' }: CardHeaderProps) {
  const iconClasses =
    iconTone === 'analytics'
      ? 'bg-analytics-soft text-analytics'
      : 'bg-primary-soft text-primary';

  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', iconClasses)}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
