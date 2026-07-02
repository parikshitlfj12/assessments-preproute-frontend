import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightSlot, className, id, required, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label-base">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              leftIcon && 'pl-10',
              rightSlot && 'pr-11',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
