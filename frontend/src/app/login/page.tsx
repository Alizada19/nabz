'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/api/auth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await authService.login(values);
      if (res.success && res.data) {
        login(res.data.accessToken, res.data.refreshToken, res.data.user);
        success('Logged in successfully!');
        router.push('/dashboard');
      } else {
        error(res.message || 'Login failed');
      }
    } catch (err: any) {
      console.error(err);
      const apiError = err.response?.data?.message || 'Invalid email or password';
      error(apiError);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome to Nabz
          </h2>
          <p className="mt-1.5 text-center text-sm font-medium text-gray-500">
            Login to access your blood donation dashboard
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full py-2.5 rounded-xl font-bold" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <span>Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="font-bold text-red-600 hover:text-red-700 hover:underline"
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
