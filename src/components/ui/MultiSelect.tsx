import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  emptyMessage?: string;
  required?: boolean;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select from drop-down',
  error,
  disabled,
  emptyMessage = 'No options available',
  required,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value],
  );

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const remove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="label-base">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-label={label ? `${label}: ${placeholder}` : placeholder}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'input-base flex min-h-[46px] cursor-pointer flex-wrap items-center gap-1.5 pr-10 text-left',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            disabled && 'cursor-not-allowed bg-surface-muted',
          )}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-ink-400">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => remove(opt.value, e)}
                  className="rounded p-0.5 hover:bg-brand-100"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          )}
          <ChevronDown
            className={cn(
              'pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400 transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>

        {open && !disabled && (
          <div className="absolute z-30 mt-2 w-full animate-scale-in overflow-hidden rounded-xl border border-surface-border bg-white shadow-pop">
            <div className="flex items-center gap-2 border-b border-surface-border px-3 py-2">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-ink-400">{emptyMessage}</p>
              ) : (
                filtered.map((opt) => {
                  const active = value.includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => toggle(opt.value)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-surface-muted"
                    >
                      <span>{opt.label}</span>
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border transition',
                          active
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-surface-border',
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
