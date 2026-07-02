import { create } from 'zustand';
import type { AuthUser } from '@/types';
import { tokenStorage, userStorage } from '@/lib/storage';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: tokenStorage.get(),
  user: userStorage.get(),
  isAuthenticated: Boolean(tokenStorage.get()),
  setSession: (token, user) => {
    tokenStorage.set(token);
    userStorage.set(user);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    tokenStorage.clear();
    userStorage.clear();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
