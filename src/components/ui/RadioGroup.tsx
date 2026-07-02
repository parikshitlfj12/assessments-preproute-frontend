import { cn } from '@/lib/utils';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  className?: string;
}

/** Horizontal radio group (e.g. Test Difficulty Level) matching the Figma. */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  name,
  className,
}: RadioGroupProps<T>) {
  return (
    <div className={cn('flex flex-wrap items-center gap-6', className)} role="radiogroup">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-700"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border-2 transition',
                active ? 'border-brand-500' : 'border-surface-border',
              )}
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
