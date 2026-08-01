'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { Activity } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values: ForgotFormValues) => {
    // Mocking password reset flow as per instruction
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('Reset instructions sent if email exists!');
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Reset Password
          </h2>
          <p className="mt-1.5 text-center text-sm font-medium text-gray-500">
            Recover access to your Nabz account
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 pt-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-green-800 text-sm font-medium">
              Check your inbox! We have simulated sending password reset instructions to your email address.
            </div>
            <Link
              href="/login"
              className="block font-bold text-red-600 hover:text-red-700 text-sm hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" className="w-full py-2.5 rounded-xl font-bold" isLoading={isSubmitting}>
              Send Recovery Email
            </Button>

            <div className="text-center text-xs text-gray-500">
              <Link href="/login" className="font-bold text-red-600 hover:text-red-700 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
