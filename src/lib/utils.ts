import clsx, { type ClassValue } from 'clsx';
import DOMPurify from 'dompurify';

/** Tailwind-friendly className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Tags/attributes the rich-text editor is allowed to produce or render.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'strong', 'i', 'em', 'u', 's', 'strike',
    'ul', 'ol', 'li', 'a', 'br', 'p', 'div', 'span',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/** Sanitize rich-text HTML before storing or rendering it (guards against XSS). */
export function sanitizeHtml(html?: string | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
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

/** Strip HTML tags to plain text (for tooltips, previews, list labels). */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
