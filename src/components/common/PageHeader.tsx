import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  actions,
  divider = true,
}: {
  breadcrumbs?: Crumb[];
  title?: string;
  description?: string;
  actions?: ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
        divider && 'border-b border-surface-border',
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-1 text-sm text-ink-400">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {crumb.to ? (
                  <Link to={crumb.to} className="font-medium transition hover:text-brand-600">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink-700">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            ))}
          </nav>
        )}
        {title && <h1 className="truncate text-xl font-extrabold text-ink-900">{title}</h1>}
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
