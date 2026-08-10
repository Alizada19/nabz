'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { donorProfilesService, UpdateDonorProfileDto } from '@/api/donorProfiles';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Heart, ShieldAlert, Calendar, Smile, Info } from 'lucide-react';

const donorProfileSchema = z.object({
  bloodType: z.string().min(1, 'Please select a blood type'),
  availableStatus: z.boolean(),
  lastDonationDate: z.string().optional().nullable(),
});

type DonorProfileValues = z.infer<typeof donorProfileSchema>;

export default function DonorProfilePage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DonorProfileValues>({
    resolver: zodResolver(donorProfileSchema),
  });

  const fetchDonorProfile = async () => {
    setLoading(true);
    try {
      const res = await donorProfilesService.getMine();
      if (res.success && res.data) {
        setDonorProfile(res.data);
        // Format last donation date for HTML date input: YYYY-MM-DD
        let formattedDate = '';
        if (res.data.lastDonationDate) {
          formattedDate = new Date(res.data.lastDonationDate).toISOString().split('T')[0];
        }

        reset({
          bloodType: res.data.bloodType?.name || 'A+',
          availableStatus: res.data.availableStatus,
          lastDonationDate: formattedDate || null,
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        // If profile doesn't exist, create it with a default A+ bloodType
        try {
          const createRes = await donorProfilesService.create({ bloodType: 'A+' });
          if (createRes.success && createRes.data) {
            setDonorProfile(createRes.data);
            reset({
              bloodType: 'A+',
              availableStatus: true,
              lastDonationDate: null,
            });
            success('Donor profile initialized!');
          }
        } catch (createErr) {
          console.error(createErr);
          error('Failed to initialize donor profile');
        }
      } else {
        error('Failed to load donor profile info');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'individual') {
      fetchDonorProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (values: DonorProfileValues) => {
    try {
      const updateDto: UpdateDonorProfileDto = {
        bloodType: values.bloodType,
        availableStatus: values.availableStatus,
        lastDonationDate: values.lastDonationDate || null,
      };

      const res = await donorProfilesService.updateMine(updateDto);
      if (res.success && res.data) {
        setDonorProfile(res.data);
        success('Donor profile updated successfully!');
        reset(values);
      } else {
        error(res.message || 'Failed to update donor profile');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update donor profile variables');
    }
  };

  if (user?.role !== 'individual') {
    return (
      <SidebarLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Access Denied</h3>
            <p className="text-xs text-gray-500">
              Only individual accounts can configure a donor profile. Organizations coordinate donors
              through their own organization dashboards.
            </p>
          </CardContent>
        </Card>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-600 fill-current animate-pulse" />
            <span>Donor Profile Settings</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your blood type, availability status, and track your life-saving donations.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SkeletonCard />
            </div>
            <div className="md:col-span-1">
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Configuration Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Blood Donor Variables</CardTitle>
                <CardDescription>
                  Keep these accurate so emergency seekers can find you within proximity radius rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Your Blood Group"
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

                    {/* Available Status selector */}
                    <Select
                      label="Are you available to donate now?"
                      options={[
                        { value: 'true', label: 'Yes - I am active and available' },
                        { value: 'false', label: 'No - I am busy/on-hold' },
                      ]}
                      error={errors.availableStatus?.message}
                      value={watch('availableStatus') ? 'true' : 'false'}
                      onChange={(e) => setValue('availableStatus', e.target.value === 'true', { shouldDirty: true })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                    <Input
                      label="Last Donation Date (Optional)"
                      type="date"
                      error={errors.lastDonationDate?.message}
                      value={watch('lastDonationDate') || ''}
                      onChange={(e) => setValue('lastDonationDate', e.target.value || null, { shouldDirty: true })}
                    />

                    <div className="flex flex-col gap-1.5 justify-end pb-1.5">
                      <p className="text-xs font-semibold text-gray-700">Total Life-saving Donations</p>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-extrabold text-gray-900 flex items-center justify-between">
                        <span>{donorProfile?.totalDonations || 0} times donated</span>
                        <Smile className="h-4.5 w-4.5 text-green-600 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <Button type="submit" className="px-6 font-bold" isLoading={isSubmitting} disabled={!isDirty}>
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Side summary card */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs leading-relaxed text-gray-600">
                  <div className="flex gap-2.5 bg-red-50 p-3 rounded-xl border border-red-100 font-medium text-red-900">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>The recommended safe waiting period between whole blood donations is <b>56 days (8 weeks)</b>.</span>
                  </div>
                  <p>
                    By keeping your availability turned <b>ON</b>, you consent to being matched with nearby seeker requests and receiving system push notifications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
