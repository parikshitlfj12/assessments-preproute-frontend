import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui/Logo';
import { LoginIllustration } from '@/components/ui/LoginIllustration';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { login as loginRequest } from '@/api/auth';
import { getApiErrorMessage } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userId: '', password: '' },
  });

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { token, user } = await loginRequest(values.userId, values.password);
      setSession(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f8fe] p-4 lg:p-6">
      {/* Illustration sits directly on the page background */}
      <div className="hidden w-1/2 items-center justify-center lg:flex">
        <LoginIllustration className="h-auto w-3/5 max-w-lg" />
      </div>

      {/* Login card floating on top of the background */}
      <div className="flex w-full items-center justify-center rounded-3xl border border-brand-100 bg-white shadow-card lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in p-8 sm:p-10">
          <Logo className="mb-10" />
          <h1 className="text-2xl font-extrabold text-ink-900">Login</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Use your company provided login credentials
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <Input
              label="User ID"
              placeholder="Enter User ID"
              autoComplete="username"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.userId?.message}
              {...register('userId')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="rounded-lg p-1.5 text-ink-400 transition hover:bg-surface-muted hover:text-ink-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex justify-start">
              <button
                type="button"
                className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                onClick={() => toast('Please contact your administrator to reset your password.')}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
