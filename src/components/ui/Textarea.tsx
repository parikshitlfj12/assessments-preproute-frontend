import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, name, ...props }, ref) => {
    const fieldId = id ?? name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="label-base">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          className={cn(
            'input-base min-h-[96px] resize-y leading-relaxed',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
