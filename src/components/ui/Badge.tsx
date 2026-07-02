import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'gray' | 'green' | 'blue' | 'amber' | 'red' | 'teal' | 'indigo';

const tones: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-600',
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  teal: 'bg-teal-50 text-teal-600',
  indigo: 'bg-brand-50 text-brand-700',
};

export function Badge({
  children,
  tone = 'gray',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const difficultyTone: Record<string, Tone> = {
  easy: 'teal',
  medium: 'amber',
  hard: 'red',
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <Badge tone={difficultyTone[difficulty] ?? 'gray'} className="capitalize">
      {difficulty}
    </Badge>
  );
}

const statusTone: Record<string, Tone> = {
  live: 'green',
  draft: 'gray',
  expired: 'red',
  unpublished: 'amber',
};

const statusDot: Record<string, string> = {
  live: 'bg-emerald-500',
  draft: 'bg-slate-400',
  expired: 'bg-red-500',
  unpublished: 'bg-amber-500',
};

export function StatusBadge({ status }: { status: string | null }) {
  const value = status ?? 'draft';
  return (
    <Badge tone={statusTone[value] ?? 'gray'} className="capitalize">
      <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[value] ?? 'bg-slate-400')} />
      {value}
    </Badge>
  );
}
