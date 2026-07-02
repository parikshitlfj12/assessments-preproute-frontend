import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-border bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-ink-500 transition hover:bg-surface-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          className="relative rounded-full p-2 text-ink-500 transition hover:bg-surface-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-surface-muted"
          >
            <img
              src="/avatar.png"
              alt={user?.name ?? 'User avatar'}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-100"
              draggable={false}
            />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight text-ink-900">
                {user?.name ?? 'User'}
              </span>
              <span className="block text-xs capitalize leading-tight text-ink-400">
                {user?.role ?? 'member'}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 animate-scale-in overflow-hidden rounded-xl border border-surface-border bg-white p-1.5 shadow-pop">
              <div className="border-b border-surface-border px-3 py-2.5">
                <p className="text-sm font-bold text-ink-900">{user?.name}</p>
                <p className="text-xs text-ink-400">@{user?.userId}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
