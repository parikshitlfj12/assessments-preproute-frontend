import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  showSign?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** Compact number field with up/down steppers, matching the marking-scheme boxes. */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  showSign = false,
  className,
  'aria-label': ariaLabel,
}: NumberStepperProps) {
  const clamp = (n: number) => {
    let next = n;
    if (min != null) next = Math.max(min, next);
    if (max != null) next = Math.min(max, next);
    return next;
  };

  const display = showSign && value > 0 ? `+${value}` : String(value);

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between rounded-xl border border-surface-border bg-white pl-3.5 pr-1.5 shadow-sm transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100',
        className,
      )}
    >
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={display}
        onChange={(e) => {
          const parsed = Number(e.target.value.replace('+', ''));
          if (!Number.isNaN(parsed)) onChange(clamp(parsed));
        }}
        className="w-full bg-transparent py-2.5 text-sm font-semibold text-ink-900 outline-none"
      />
      <div className="flex flex-col">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increase"
          onClick={() => onChange(clamp(value + step))}
          className="rounded p-0.5 text-ink-400 transition hover:text-brand-600"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrease"
          onClick={() => onChange(clamp(value - step))}
          className="rounded p-0.5 text-ink-400 transition hover:text-brand-600"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
