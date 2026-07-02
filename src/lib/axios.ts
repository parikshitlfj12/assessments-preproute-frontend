import axios, { AxiosError } from 'axios';
import { tokenStorage } from './storage';
import type { ApiEnvelope } from '@/types';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://admin-moderator-backend-staging.up.railway.app/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // Railway staging can cold-start; give requests generous headroom.
  timeout: 30000,
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Dispatched when the API rejects the token so the app can log the user out. */
export const AUTH_ERROR_EVENT = 'preproute:auth-error';

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    // A 401 on the login request is just bad credentials — the login page
    // surfaces that itself. Only treat 401s as an expired session when a token
    // was actually present (i.e. the user really was logged in).
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      const hadToken = Boolean(tokenStorage.get());
      tokenStorage.clear();
      if (hadToken) window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT));
    }
    return Promise.reject(error);
  },
);

interface ValidationErrorItem {
  msg?: string;
  path?: string;
}

/** Normalises an axios error into a human-friendly message. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | (ApiEnvelope<unknown> & { errors?: ValidationErrorItem[] })
      | undefined;
    // Surface field-level validation details when the backend provides them.
    if (data?.errors?.length) {
      const details = data.errors
        .map((e) => e.msg)
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');
      if (details) return data.message ? `${data.message}: ${details}` : details;
    }
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Network error — please check your connection.';
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
