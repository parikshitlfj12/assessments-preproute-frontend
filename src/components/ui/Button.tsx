import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm focus-visible:ring-brand-200',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-200',
  outline:
    'border border-surface-border bg-white text-ink-700 hover:bg-surface-muted focus-visible:ring-brand-100',
  ghost: 'text-ink-700 hover:bg-surface-muted focus-visible:ring-brand-100',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm focus-visible:ring-red-200',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150',
        'focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
