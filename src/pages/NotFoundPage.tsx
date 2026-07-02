import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-ink-900">404</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>
  );
}
