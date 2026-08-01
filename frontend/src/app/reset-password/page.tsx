'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { success } = useToast();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values: ResetFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('Password updated successfully!');
    setSubmitted(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create New Password
          </h2>
          <p className="mt-1.5 text-center text-sm font-medium text-gray-500">
            Enter your new secure password
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 pt-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-green-800 text-sm font-medium">
              Password reset successful! Redirecting you to login...
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full py-2.5 rounded-xl font-bold" isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
