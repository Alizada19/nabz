'use client';

import React, { useState, useEffect } from 'react';
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
import { MapPin, Navigation, Heart, PlusCircle, User, Activity, Building, Info } from 'lucide-react';

const createRequestSchema = z.object({
  requestType: z.enum(['INDIVIDUAL', 'HOSPITAL', 'BLOOD_BANK', 'NGO']),
  bloodType: z.string().min(1, 'Please select a blood type'),
  unitsRequired: z.number().nullable().optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),

  // Individual specific
  requesterName: z.string().min(1, 'Requester Name is required'),
  requesterPhone: z.string().min(1, 'Phone Number is required'),
  currentLocationName: z.string().min(1, 'Address / Current Location is required'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  preferredHospital: z.string().nullable().optional(),
  additionalNotes: z.string().nullable().optional(),

  // Organization specific (Hospital / Blood Bank)
  hospitalName: z.string().nullable().optional(),
  hospitalAddress: z.string().nullable().optional(),
  coordinatorName: z.string().nullable().optional(),
  coordinatorContact: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.requestType === 'HOSPITAL') {
    if (!data.hospitalName || data.hospitalName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hospital name is required',
        path: ['hospitalName'],
      });
    }
    if (!data.hospitalAddress || data.hospitalAddress.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hospital address is required',
        path: ['hospitalAddress'],
      });
    }
    if (data.unitsRequired === undefined || data.unitsRequired === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Units Required is required for hospitals',
        path: ['unitsRequired'],
      });
    }
    if (!data.coordinatorName || data.coordinatorName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordinator name is required',
        path: ['coordinatorName'],
      });
    }
    if (!data.coordinatorContact || data.coordinatorContact.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordinator contact is required',
        path: ['coordinatorContact'],
      });
    }
  }

  if (data.requestType === 'BLOOD_BANK') {
    if (!data.hospitalName || data.hospitalName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Blood Bank name is required',
        path: ['hospitalName'],
      });
    }
    if (!data.hospitalAddress || data.hospitalAddress.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Blood Bank address is required',
        path: ['hospitalAddress'],
      });
    }
    if (data.unitsRequired === undefined || data.unitsRequired === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Units Required is required for blood banks',
        path: ['unitsRequired'],
      });
    }
    if (!data.coordinatorName || data.coordinatorName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordinator name is required',
        path: ['coordinatorName'],
      });
    }
    if (!data.coordinatorContact || data.coordinatorContact.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordinator contact is required',
        path: ['coordinatorContact'],
      });
    }
  }

  if (data.requestType === 'NGO') {
    if (!data.hospitalName || data.hospitalName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization name is required',
        path: ['hospitalName'],
      });
    }
    if (!data.hospitalAddress || data.hospitalAddress.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization address is required',
        path: ['hospitalAddress'],
      });
    }
    if (data.unitsRequired === undefined || data.unitsRequired === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Units Required is required for NGO requests',
        path: ['unitsRequired'],
      });
    }
    if (!data.coordinatorName || data.coordinatorName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordinator name is required',
        path: ['coordinatorName'],
      });
    }
    if (!data.coordinatorContact || data.coordinatorContact.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordinator contact is required',
        path: ['coordinatorContact'],
      });
    }
  }
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      requestType: 'INDIVIDUAL',
      bloodType: 'A+',
      unitsRequired: 2,
      urgencyLevel: 'medium',
      requesterName: user?.name || '',
      requesterPhone: user?.phone || '',
      currentLocationName: '',
      preferredHospital: '',
      hospitalName: '',
      hospitalAddress: '',
      latitude: user?.latitude || 3.1390,
      longitude: user?.longitude || 101.6869,
      coordinatorName: '',
      coordinatorContact: '',
      additionalNotes: '',
    },
  });

  // Pre-populate when user is loaded
  useEffect(() => {
    if (user) {
      reset({
        requestType: 'INDIVIDUAL',
        bloodType: 'A+',
        unitsRequired: 2,
        urgencyLevel: 'medium',
        requesterName: user.name || '',
        requesterPhone: user.phone || '',
        currentLocationName: '',
        preferredHospital: '',
        hospitalName: '',
        hospitalAddress: '',
        latitude: user.latitude || 3.1390,
        longitude: user.longitude || 101.6869,
        coordinatorName: '',
        coordinatorContact: '',
        additionalNotes: '',
      });
    }
  }, [user, reset]);

  const requestType = watch('requestType');
  const preferredHospital = watch('preferredHospital');

  // Individual displays hospital-specific fields if Preferred Hospital is selected/entered.
  const showPreferredHospitalFields = requestType === 'INDIVIDUAL' && !!preferredHospital && preferredHospital.trim() !== '';

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
        if (requestType !== 'INDIVIDUAL') {
          setValue('hospitalAddress', `Detected near (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } else {
          setValue('currentLocationName', `Detected Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
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
    try {
      const payload: any = {
        requestType: values.requestType,
        bloodType: values.bloodType,
        urgencyLevel: values.urgencyLevel,
        unitsRequired: values.unitsRequired || null,
        requesterPhone: values.requesterPhone,
        preferredHospital: values.preferredHospital || null,
        additionalNotes: values.additionalNotes || null,
      };

      if (values.requestType === 'INDIVIDUAL') {
        payload.hospitalName = values.preferredHospital || 'Patient Home / Residence';
        payload.hospitalAddress = values.currentLocationName || 'Patient Current Address';
        payload.latitude = values.latitude || null;
        payload.longitude = values.longitude || null;
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

            {/* Requester Type: MANDATORY FIRST FIELD */}
            <Select
              label="Requester Type *"
              options={[
                { value: 'INDIVIDUAL', label: 'Individual' },
                { value: 'HOSPITAL', label: 'Hospital' },
                { value: 'BLOOD_BANK', label: 'Blood Bank' },
                { value: 'NGO', label: 'NGO' },
              ]}
              error={errors.requestType?.message}
              {...register('requestType')}
            />

            {/* Standard parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Type Required *"
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
                label="Urgency Level *"
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

            {/* DYNAMIC FIELD RENDERING */}

            {/* 1. INDIVIDUAL FIELDS */}
            {requestType === 'INDIVIDUAL' && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-indigo-800 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs font-semibold">
                  <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                  <span>You are creating an Individual seeker request.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Requester Name *"
                    placeholder="E.g. John Doe"
                    error={errors.requesterName?.message}
                    {...register('requesterName')}
                  />

                  <Input
                    label="Phone Number *"
                    placeholder="E.g. +60123456789"
                    error={errors.requesterPhone?.message}
                    {...register('requesterPhone')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Address / Current Location *"
                    placeholder="E.g. Apartment, Jalan Ampang, KL"
                    error={errors.currentLocationName?.message}
                    {...register('currentLocationName')}
                  />

                  <Input
                    label="Preferred Hospital (optional)"
                    placeholder="E.g. Pantai Hospital Kuala Lumpur"
                    error={errors.preferredHospital?.message}
                    {...register('preferredHospital')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Units Required (optional)"
                    type="number"
                    placeholder="E.g. 2 (optional)"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />

                  <div className="flex flex-col justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={detectLocation}
                      className="text-xs font-bold text-red-600 border-red-100 hover:bg-red-50 py-2.5 h-[46px]"
                      isLoading={detectingLocation}
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1" /> Detect My GPS Location (optional)
                    </Button>
                  </div>
                </div>

                {/* Optional coordinates input for Individual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <Input
                    label="Latitude (optional)"
                    type="number"
                    step="any"
                    error={errors.latitude?.message}
                    {...register('latitude', { valueAsNumber: true })}
                  />
                  <Input
                    label="Longitude (optional)"
                    type="number"
                    step="any"
                    error={errors.longitude?.message}
                    {...register('longitude', { valueAsNumber: true })}
                  />
                </div>

                {/* Preferred Hospital sub-fields (displayed only if filled out) */}
                {showPreferredHospitalFields && (
                  <div className="border-l-4 border-indigo-500 bg-indigo-50/20 p-5 rounded-r-2xl space-y-4 animate-in slide-in-from-left duration-200">
                    <div>
                      <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Preferred Hospital Specific Info</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Please provide coordinates if known to route nearby donors to this hospital.</p>
                    </div>

                    <Input
                      label="Hospital Name"
                      placeholder="E.g. Pantai Hospital"
                      disabled
                      value={preferredHospital || ''}
                    />

                    <Input
                      label="Hospital Address"
                      placeholder="E.g. Jalan Bukit Pantai, Kuala Lumpur"
                      error={errors.hospitalAddress?.message}
                      {...register('hospitalAddress')}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-gray-500 font-semibold">Hospital GPS Coordinates</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={detectLocation}
                        className="text-[10px] font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        isLoading={detectingLocation}
                      >
                        <Navigation className="h-3 w-3 mr-1" /> Detect Hospital GPS
                      </Button>
                    </div>

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
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    placeholder="E.g. Patient needs O+ replacement blood for upcoming bypass surgery..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-red-500 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* 2. HOSPITAL FIELDS */}
            {requestType === 'HOSPITAL' && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Hospital Name *"
                    placeholder="E.g. Hospital Kuala Lumpur"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />

                  <Input
                    label="Units Required *"
                    type="number"
                    placeholder="E.g. 5"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Coordinator Name *"
                    placeholder="E.g. Dr. Sarah Lee"
                    error={errors.coordinatorName?.message}
                    {...register('coordinatorName')}
                  />

                  <Input
                    label="Coordinator Contact *"
                    placeholder="E.g. +60123456789"
                    error={errors.coordinatorContact?.message}
                    {...register('coordinatorContact')}
                  />
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Hospital Coordinates</h4>
                      <p className="text-xs text-gray-400">Essential for proximity matchmaking with donors</p>
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
                    label="Hospital Address *"
                    placeholder="E.g. Jalan Pahang, 53000 Kuala Lumpur"
                    error={errors.hospitalAddress?.message}
                    {...register('hospitalAddress')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Latitude *"
                      type="number"
                      step="any"
                      error={errors.latitude?.message}
                      {...register('latitude', { valueAsNumber: true })}
                    />

                    <Input
                      label="Longitude *"
                      type="number"
                      step="any"
                      error={errors.longitude?.message}
                      {...register('longitude', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    placeholder="E.g. Intensive care unit emergency bypass preparation..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-red-500 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* 3. BLOOD BANK FIELDS */}
            {requestType === 'BLOOD_BANK' && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Blood Bank *"
                    placeholder="E.g. National Blood Centre"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />

                  <Input
                    label="Units Required *"
                    type="number"
                    placeholder="E.g. 10"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Coordinator Name *"
                    placeholder="E.g. Mr. Robert Chang"
                    error={errors.coordinatorName?.message}
                    {...register('coordinatorName')}
                  />

                  <Input
                    label="Coordinator Contact *"
                    placeholder="E.g. +60123456789"
                    error={errors.coordinatorContact?.message}
                    {...register('coordinatorContact')}
                  />
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Blood Bank Coordinates</h4>
                      <p className="text-xs text-gray-400">Essential for geographic proximity distance matching</p>
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
                    label="Blood Bank Address *"
                    placeholder="E.g. Jalan Selangor, Shah Alam"
                    error={errors.hospitalAddress?.message}
                    {...register('hospitalAddress')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Latitude *"
                      type="number"
                      step="any"
                      error={errors.latitude?.message}
                      {...register('latitude', { valueAsNumber: true })}
                    />

                    <Input
                      label="Longitude *"
                      type="number"
                      step="any"
                      error={errors.longitude?.message}
                      {...register('longitude', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    placeholder="E.g. Leveling up stock reserves due to dengue seasonal spike..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-red-500 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* 4. NGO FIELDS */}
            {requestType === 'NGO' && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Organization Name *"
                    placeholder="E.g. Red Crescent Society"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />

                  <Input
                    label="Units Required *"
                    type="number"
                    placeholder="E.g. 10"
                    error={errors.unitsRequired?.message}
                    {...register('unitsRequired', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Coordinator Name *"
                    placeholder="E.g. Volunteer Coordinator"
                    error={errors.coordinatorName?.message}
                    {...register('coordinatorName')}
                  />

                  <Input
                    label="Coordinator Contact *"
                    placeholder="E.g. +60123456789"
                    error={errors.coordinatorContact?.message}
                    {...register('coordinatorContact')}
                  />
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 tracking-wide uppercase">Campaign Location</h4>
                      <p className="text-xs text-gray-400">Campaign venue coordinates for proximity donor matching</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      className="text-xs font-semibold text-red-600 border-red-100 hover:bg-red-50"
                      isLoading={detectingLocation}
                    >
                      <Navigation className="h-3 w-3 mr-1" /> Detect Location GPS
                    </Button>
                  </div>

                  <Input
                    label="Campaign Address *"
                    placeholder="E.g. Jalan Sultan, 50000 Kuala Lumpur"
                    error={errors.hospitalAddress?.message}
                    {...register('hospitalAddress')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Latitude *"
                      type="number"
                      step="any"
                      error={errors.latitude?.message}
                      {...register('latitude', { valueAsNumber: true })}
                    />

                    <Input
                      label="Longitude *"
                      type="number"
                      step="any"
                      error={errors.longitude?.message}
                      {...register('longitude', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    placeholder="E.g. Blood donation campaign for flood victims..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-red-500 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
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
