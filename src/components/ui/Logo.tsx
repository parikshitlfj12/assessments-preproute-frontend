import { cn } from '@/lib/utils';

/** PrepRoute wordmark (or compact brand mark). Uses assets from /public. */
export function Logo({
  className,
  compact = false,
  iconOnly = false,
}: {
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  if (iconOnly) {
    return (
      <img
        src="/favicon.svg"
        alt="PrepRoute"
        className={cn('h-8 w-8 select-none', className)}
        draggable={false}
      />
    );
  }

  return (
    <img
      src="/logo.png"
      alt="PrepRoute"
      className={cn('w-auto select-none', compact ? 'h-7' : 'h-8', className)}
      draggable={false}
    />
  );
}
