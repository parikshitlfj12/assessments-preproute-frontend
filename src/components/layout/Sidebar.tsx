import { NavLink } from 'react-router-dom';
import { LayoutDashboard, SquarePen, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

const primaryNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tests/new', label: 'Test Creation', icon: SquarePen },
];

/** Shared nav links so the full sidebar and the collapsed drawer always match. */
function NavItems({ onNavigate, collapsible = false }: { onNavigate?: () => void; collapsible?: boolean }) {
  // In the collapsed drawer, labels stay hidden until the rail expands on hover/focus.
  const labelClass = cn(
    'whitespace-nowrap',
    collapsible && 'hidden group-hover:block group-focus-within:block',
  );

  return (
    <>
      {primaryNav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              <span className={labelClass}>{label}</span>
            </>
          )}
        </NavLink>
      ))}

      {/* Present in the design; feature not part of this build. */}
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          toast('Test Tracking is coming soon.');
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-500 transition hover:bg-surface-muted hover:text-ink-900"
      >
        <ClipboardList className="h-5 w-5 shrink-0" />
        <span className={labelClass}>Test Tracking</span>
      </button>
    </>
  );
}

export function Sidebar({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  if (collapsed) {
    // A thin icon rail that expands into a full drawer on hover/focus,
    // overlaying the content instead of shifting it.
    return (
      <div className="group relative h-full w-16">
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-40 flex w-16 flex-col overflow-hidden border-r border-surface-border bg-white',
            'transition-[width] duration-200 ease-out',
            'group-hover:w-64 group-hover:shadow-2xl focus-within:w-64 focus-within:shadow-2xl',
          )}
        >
          <div className="flex h-16 items-center px-5">
            <Logo iconOnly className="shrink-0 group-hover:hidden group-focus-within:hidden" />
            <span className="hidden group-hover:block group-focus-within:block">
              <Logo />
            </span>
          </div>

          <nav className="flex-1 space-y-1 overflow-hidden px-3 py-4">
            <NavItems onNavigate={onNavigate} collapsible />
          </nav>
        </aside>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-surface-border bg-white">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <NavItems onNavigate={onNavigate} />
      </nav>
    </aside>
  );
}
