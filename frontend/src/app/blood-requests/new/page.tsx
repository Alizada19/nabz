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
import { MapPin, Navigation, Heart, PlusCircle, HelpCircle, User, Shield, Info, Activity, Building } from 'lucide-react';

const createRequestSchema = z.object({
  requestType: z.enum(['INDIVIDUAL', 'HOSPITAL', 'BLOOD_BANK']),
  bloodType: z.string().min(1, 'Please select a blood type'),
  unitsRequired: z.number().optional().nullable(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),

  // Individual specific
  requesterPhone: z.string().optional().nullable(),
  preferredHospital: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
  currentLocationName: z.string().optional().nullable(),

  // Organization specific
  hospitalName: z.string().optional().nullable(),
  hospitalAddress: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  coordinatorName: z.string().optional().nullable(),
  coordinatorContact: z.string().optional().nullable(),
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      requestType: 'INDIVIDUAL',
      bloodType: 'A+',
      unitsRequired: 2,
      urgencyLevel: 'medium',
      latitude: user?.latitude || 3.1390,
      longitude: user?.longitude || 101.6869,
      requesterPhone: user?.phone || '',
    },
  });

  const requestType = watch('requestType');

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
        success('Proximity coordinates detected!');
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
    // Perform manual/custom validation depending on requestType
    if (values.requestType === 'HOSPITAL' || values.requestType === 'BLOOD_BANK') {
      if (!values.hospitalName) {
        error(`${values.requestType === 'HOSPITAL' ? 'Hospital' : 'Blood Bank'} Name is required`);
        return;
      }
      if (!values.hospitalAddress) {
        error(`${values.requestType === 'HOSPITAL' ? 'Hospital' : 'Blood Bank'} Address is required`);
        return;
      }
      if (!values.unitsRequired) {
        error('Units required is required for participating organization requests');
        return;
      }
    }

    try {
      const payload: any = {
        requestType: values.requestType,
        bloodType: values.bloodType,
        urgencyLevel: values.urgencyLevel,
        unitsRequired: values.unitsRequired || null,
        requesterPhone: values.requesterPhone || null,
        preferredHospital: values.preferredHospital || null,
        additionalNotes: values.additionalNotes || null,
      };

      if (values.requestType === 'INDIVIDUAL') {
        payload.hospitalName = values.preferredHospital || 'Patient Home / Residence';
        payload.hospitalAddress = values.currentLocationName || 'Patient Current Coordinates';
        payload.latitude = user?.latitude || 3.1390;
        payload.longitude = user?.longitude || 101.6869;
      } else {
        payload.hospitalName = values.hospitalName || null;
        payload.hospitalAddress = values.hospitalAddress || null;
        payload.latitude = values.latitude || null;
        payload.longitude = values.longitude || null;
        payload.coordinatorName = values.coordinatorName || null;
        payload.coordinatorContact = values.coordinatorContact || null;
      }

      const res = await bloodRequestsService.create(payload);
      if (res.success && res.data) {
        success('Emergency Blood Request broadcasted successfully!');
        router.push(`/blood-requests`);
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
            Publish a live coordinating request connecting individual seeker needs to nearby compatible donors.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Requester Type: The Critical Option */}
            <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 space-y-3">
              <label className="block text-xs font-bold text-red-800 tracking-wide uppercase">
                Requester Type (Origin Source)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('requestType', 'INDIVIDUAL')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-1.5 ${
                    requestType === 'INDIVIDUAL'
                      ? 'border-red-500 bg-white text-red-600 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-bold">Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('requestType', 'HOSPITAL')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-1.5 ${
                    requestType === 'HOSPITAL'
                      ? 'border-red-500 bg-white text-red-600 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <Activity className="h-5 w-5" />
                  <span className="text-xs font-bold">Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('requestType', 'BLOOD_BANK')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-1.5 ${
                    requestType === 'BLOOD_BANK'
                      ? 'border-red-500 bg-white text-red-600 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <Building className="h-5 w-5" />
                  <span className="text-xs font-bold">Blood Bank</span>
                </button>
              </div>
            </div>

            {/* Standard blood parameters */}
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

            {/* DYNAMIC SUBFIELDS DEPENDING ON REQUEST TYPE */}
            {requestType === 'INDIVIDUAL' && (
              <div className="space-y-4 border-t border-gray-50 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-indigo-800 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs font-semibold">
                  <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                  <span>You are creating an Individual request. Direct coordinate-based GPS tracking is optional.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Patient / Seeker Full Name"
                    type="text"
                    defaultValue={user?.name || ''}
                    placeholder="E.g. John Doe"
                    disabled
                  />

                  <Input
                    label="Requester Contact Phone"
                    type="text"
                    placeholder="E.g. +60123456789"
                    error={errors.requesterPhone?.message}
                    {...register('requesterPhone')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Preferred Hospital (Optional)"
                    type="text"
                    placeholder="E.g. General Hospital Kuala Lumpur"
                    error={errors.preferredHospital?.message}
                    {...register('preferredHospital')}
                  />

                  <Input
                    label="Current Address / Location Name"
                    type="text"
                    placeholder="E.g. Apartment, Jalan Ampang, KL"
                    error={errors.currentLocationName?.message}
                    {...register('currentLocationName')}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Units Required (Optional Bags)"
                    type="number"
                    placeholder="Leave empty or specify units required"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Additional Notes</label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    placeholder="E.g. Patients needsWhole-blood replacement by tomorrow morning..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Hospital Request fields */}
            {requestType === 'HOSPITAL' && (
              <div className="space-y-4 border-t border-gray-50 pt-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Hospital Name"
                    type="text"
                    placeholder="E.g. Hospital Kuala Lumpur"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />

                  <Input
                    label="Units Required (Bags)"
                    type="number"
                    placeholder="E.g. 5"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Hospital Coordinator Name"
                    type="text"
                    placeholder="E.g. Dr. Sarah"
                    error={errors.coordinatorName?.message}
                    {...register('coordinatorName')}
                  />

                  <Input
                    label="Coordinator Phone Contact"
                    type="text"
                    placeholder="E.g. +60123456789"
                    error={errors.coordinatorContact?.message}
                    {...register('coordinatorContact')}
                  />
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Hospital Coordinates</h4>
                      <p className="text-xs text-gray-400">Calculates nearby donor distance matches</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      className="text-xs font-semibold text-red-600 border-red-100 hover:bg-red-50"
                      isLoading={detectingLocation}
                    >
                      <Navigation className="h-3 w-3 mr-1" /> Detect Hospital GPS
                    </Button>
                  </div>

                  <Input
                    label="Hospital Address"
                    type="text"
                    placeholder="E.g. Jalan Pahang, 53000 Kuala Lumpur"
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
              </div>
            )}

            {/* Blood Bank fields */}
            {requestType === 'BLOOD_BANK' && (
              <div className="space-y-4 border-t border-gray-50 pt-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Blood Bank Name"
                    type="text"
                    placeholder="E.g. Central State Blood Bank"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />

                  <Input
                    label="Units Required (Bags)"
                    type="number"
                    placeholder="E.g. 10"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Coordinator Name"
                    type="text"
                    placeholder="E.g. Mr. Robert"
                    error={errors.coordinatorName?.message}
                    {...register('coordinatorName')}
                  />

                  <Input
                    label="Contact Information"
                    type="text"
                    placeholder="E.g. +60123456789"
                    error={errors.coordinatorContact?.message}
                    {...register('coordinatorContact')}
                  />
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Blood Bank Coordinates</h4>
                      <p className="text-xs text-gray-400">Essential for proximity distance matching</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      className="text-xs font-semibold text-red-600 border-red-100 hover:bg-red-50"
                      isLoading={detectingLocation}
                    >
                      <Navigation className="h-3 w-3 mr-1" /> Detect Blood Bank GPS
                    </Button>
                  </div>

                  <Input
                    label="Blood Bank Address"
                    type="text"
                    placeholder="E.g. Jalan Selangor, Shah Alam"
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
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="px-6 font-bold flex items-center gap-2 bg-red-600 hover:bg-red-700" isLoading={isSubmitting}>
                <PlusCircle className="h-4 w-4" />
                <span>Submit Request</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
