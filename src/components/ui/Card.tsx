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
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-muted">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted/80">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
