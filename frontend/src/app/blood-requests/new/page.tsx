'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { bloodRequestsService } from '@/api/bloodRequests';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Heart, PlusCircle } from 'lucide-react';

const createRequestSchema = z.object({
  bloodType: z.string().min(1, 'Please select a blood type'),
  hospitalName: z.string().min(2, 'Hospital Name must be at least 2 characters long'),
  hospitalAddress: z.string().min(2, 'Hospital Address is required'),
  latitude: z.number({ message: 'Latitude is required' }),
  longitude: z.number({ message: 'Longitude is required' }),
  unitsRequired: z.number({ message: 'Units required must be specified' }).min(1, 'At least 1 unit is required'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

export default function NewBloodRequestPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();
  const [detectingLocation, setDetectingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      bloodType: 'A+',
      hospitalName: '',
      hospitalAddress: '',
      latitude: user?.latitude || 3.1390,
      longitude: user?.longitude || 101.6869,
      unitsRequired: 2,
      urgencyLevel: 'medium',
    },
  });

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
        setValue('hospitalAddress', `Detected near (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        success('Hospital coordinates detected!');
        setDetectingLocation(false);
      },
      (err) => {
        console.error(err);
        error('Failed to get current GPS location automatically.');
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (values: CreateRequestFormValues) => {
    try {
      const res = await bloodRequestsService.create(values);
      if (res.success && res.data) {
        success('Emergency Blood Request broadcasted successfully!');
        router.push(`/blood-requests/${res.data.id}`);
      } else {
        error(res.message || 'Failed to create blood request');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Error occurred while submitting request');
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Emergency Request</h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast an emergency request to compatible blood donors in the surrounding radius.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Type Required"
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

              <Select
                label="Urgency Level"
                options={[
                  { value: 'low', label: 'Low (Scheduled)' },
                  { value: 'medium', label: 'Medium (Standard Urgent)' },
                  { value: 'high', label: 'High (Immediate Danger)' },
                  { value: 'critical', label: 'Critical (Severe / Life-threatening)' },
                ]}
                error={errors.urgencyLevel?.message}
                {...register('urgencyLevel')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hospital Name"
                type="text"
                placeholder="Hospital Kuala Lumpur"
                error={errors.hospitalName?.message}
                {...register('hospitalName')}
              />

              <Input
                label="Units Required (Bags)"
                type="number"
                placeholder="2"
                error={errors.unitsRequired?.message}
                {...register('unitsRequired', { valueAsNumber: true })}
              />
            </div>

            <div className="border-t border-gray-50 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Hospital Coordinates</h4>
                  <p className="text-xs text-gray-400">Essential for calculating nearby donor proximity match distances</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectLocation}
                  className="text-xs font-semibold"
                  isLoading={detectingLocation}
                >
                  <Navigation className="h-3 w-3 mr-1" /> Detect Hospital GPS
                </Button>
              </div>

              <Input
                label="Hospital Full Address"
                type="text"
                placeholder="Jalan Pahang, 53000 Kuala Lumpur"
                error={errors.hospitalAddress?.message}
                {...register('hospitalAddress')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="px-6 font-bold flex items-center gap-2" isLoading={isSubmitting}>
                <PlusCircle className="h-4 w-4" />
                <span>Broadcast Broadcast</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
