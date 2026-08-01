'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { usersService } from '@/api/users';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { Navigation, User, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  location: z.string().min(2, 'Location name is required'),
  latitude: z.number(),
  longitude: z.number(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { success, error } = useToast();
  const [detectingLocation, setDetectingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Populate form with current user info
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone,
        location: user.location || 'Kuala Lumpur, Malaysia',
        latitude: user.latitude || 3.1390,
        longitude: user.longitude || 101.6869,
      });
    }
  }, [user, reset]);

  const detectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude, { shouldDirty: true });
        setValue('longitude', longitude, { shouldDirty: true });
        setValue('location', `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, { shouldDirty: true });
        success('Coordinates detected successfully!');
        setDetectingLocation(false);
      },
      (err) => {
        console.error(err);
        error('Failed to detect location automatically.');
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const res = await usersService.updateMe(values);
      if (res.success && res.data) {
        updateUser(res.data);
        success('Profile updated successfully!');
        reset(values); // reset dirty status
      } else {
        error(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update profile info');
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal platform profile and location settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Overview Card */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center text-center pt-8 pb-6">
              <div className="h-20 w-20 rounded-full bg-red-50 text-red-600 border-2 border-red-100 font-extrabold flex items-center justify-center text-3xl mb-4">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{user?.role} Account</p>

              <div className="w-full border-t border-gray-50 my-6" />

              <div className="w-full space-y-4 text-left text-sm font-medium">
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{user?.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{user?.location || 'No location set'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Personal Information</CardTitle>
              <CardDescription>Update your personal info, contact, and emergency response location.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Phone Number"
                    type="text"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Location Tracking Details</h4>
                      <p className="text-xs text-gray-400">Used for local donor matching and emergency requests distance mapping</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      className="text-xs font-semibold"
                      isLoading={detectingLocation}
                    >
                      <Navigation className="h-3 w-3 mr-1" /> Detect Coordinates
                    </Button>
                  </div>

                  <Input
                    label="City Name / Address"
                    type="text"
                    error={errors.location?.message}
                    {...register('location')}
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

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="px-6 font-bold" isLoading={isSubmitting} disabled={!isDirty}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
