import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  // In the question-creation flow the sidebar collapses to a compact icon rail.
  const collapsed = /\/tests\/[^/]+\/(questions|preview)/.test(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div
          className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full animate-fade-in">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute -right-11 top-3 rounded-lg bg-white p-2 text-ink-700 shadow-soft"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
