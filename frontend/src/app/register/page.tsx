'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/api/auth';
import { bloodTypesService } from '@/api/bloodTypes';
import { donorProfilesService } from '@/api/donorProfiles';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, MapPin, Navigation } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['donor', 'seeker', 'admin']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string().min(2, 'Location string is required'),
  bloodType: z.string().optional(), // Used if role is donor
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { login } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();
  const [role, setRole] = useState<'donor' | 'seeker' | 'admin'>('seeker');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'seeker',
      latitude: 3.139,
      longitude: 101.6869,
      location: 'Kuala Lumpur, Malaysia',
      bloodType: 'A+',
    },
  });

  const watchRole = watch('role');

  const detectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        setValue('location', `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        success('Coordinates detected successfully!');
        setDetectingLocation(false);
      },
      (err) => {
        console.error(err);
        error('Failed to get location. Using default mock coordinates.');
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // 1. Register the user
      const regDto = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
        latitude: values.latitude,
        longitude: values.longitude,
        location: values.location,
      };

      const res = await authService.register(regDto);

      if (res.success && res.data) {
        // Log them in
        login(res.data.accessToken, res.data.refreshToken, res.data.user);

        // 2. If donor, automatically create donor profile using bloodType
        if (values.role === 'donor' && values.bloodType) {
          try {
            await donorProfilesService.create({ bloodType: values.bloodType });
            success('Account & Donor profile created successfully!');
          } catch (donorErr) {
            console.error('Failed to create donor profile automatically:', donorErr);
            success('Account created, but donor profile must be configured in settings.');
          }
        } else {
          success('Account created successfully!');
        }

        router.push('/dashboard');
      } else {
        error(res.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error(err);
      const apiError = err.response?.data?.message || 'Registration failed. Email or phone might already be in use.';
      error(apiError);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create your Account
          </h2>
          <p className="mt-1.5 text-center text-sm font-medium text-gray-500">
            Join the Nabz Emergency Blood Network
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Ahmad Zulkifli"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="text"
              placeholder="+60123456789"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password (min 8 chars)"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Choose Role"
              options={[
                { value: 'seeker', label: 'Blood Seeker (Hospital/Family)' },
                { value: 'donor', label: 'Blood Donor (Individual)' },
              ]}
              error={errors.role?.message}
              {...register('role', {
                onChange: (e) => setRole(e.target.value),
              })}
            />

            {watchRole === 'donor' && (
              <Select
                label="Blood Type"
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
                error={errors.bloodType?.message}
                {...register('bloodType')}
              />
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">Geographic Location</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectLocation}
                className="text-xs font-semibold"
                isLoading={detectingLocation}
              >
                <Navigation className="h-3 w-3 mr-1" /> Detect Location
              </Button>
            </div>

            <Input
              label="City / Human-readable Location"
              type="text"
              placeholder="e.g. Kuala Lumpur, Malaysia"
              error={errors.location?.message}
              {...register('location')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                error={errors.latitude?.message}
                {...register('latitude', { valueAsNumber: true })}
              />

              <Input
                label="Longitude"
                type="number"
                step="any"
                error={errors.longitude?.message}
                {...register('longitude', { valueAsNumber: true })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-2.5 rounded-xl font-bold mt-2" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-bold text-red-600 hover:text-red-700 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
