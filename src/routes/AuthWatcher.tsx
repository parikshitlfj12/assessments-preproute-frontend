import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AUTH_ERROR_EVENT } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

/** Logs the user out and redirects when the API reports an expired/invalid token. */
export function AuthWatcher() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const handler = () => {
      logout();
      toast.error('Your session has expired. Please log in again.');
      navigate('/login', { replace: true });
    };
    window.addEventListener(AUTH_ERROR_EVENT, handler);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, handler);
  }, [logout, navigate]);

  return null;
}
