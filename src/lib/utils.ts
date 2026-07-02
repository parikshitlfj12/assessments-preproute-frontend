import clsx, { type ClassValue } from 'clsx';

/** Tailwind-friendly className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format an ISO date string for display (e.g. "15 Jan 2025"). */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Title-case a slug / lower-case label. */
export function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
