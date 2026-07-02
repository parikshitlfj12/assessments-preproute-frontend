import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-500', className)} />;
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-ink-400">
      <Spinner className="h-8 w-8" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
