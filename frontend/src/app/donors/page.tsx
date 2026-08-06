'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { donorsService, DonorQuery, CreateDonorDto, UpdateDonorDto, DonorDetail } from '@/api/donors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  UserCheck,
  Heart,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// Zod schemas for Register/Edit Donor
const registerDonorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bloodType: z.string().min(1, 'Please select a blood type'),
  location: z.string().min(2, 'Location is required'),
  isAvailable: z.boolean(),
  lastDonationDate: z.string().optional(),
});

const editDonorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  password: z.string().optional(),
  bloodType: z.string().min(1, 'Please select a blood type'),
  location: z.string().min(2, 'Location is required'),
  isAvailable: z.boolean(),
  lastDonationDate: z.string().optional(),
});

type RegisterDonorValues = z.infer<typeof registerDonorSchema>;
type EditDonorValues = z.infer<typeof editDonorSchema>;

export default function DonorsManagementPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState<DonorDetail[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Query state
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [registering, setRegistering] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorDetail | null>(null);
  const [deletingDonor, setDeletingDonor] = useState<DonorDetail | null>(null);
  const [viewingDonor, setViewingDonor] = useState<DonorDetail | null>(null);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const query: DonorQuery = {
        page,
        limit: 10,
      };

      if (searchTerm.trim() !== '') query.search = searchTerm;
      if (bloodTypeFilter !== '') query.bloodType = bloodTypeFilter;
      if (availabilityFilter !== '') query.isAvailable = availabilityFilter;
      if (eligibilityFilter !== '') query.eligibility = eligibilityFilter;
      if (locationFilter !== '') query.location = locationFilter;

      const res = await donorsService.findAll(query);
      if (res.success && res.data) {
        setDonors(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, bloodTypeFilter, availabilityFilter, eligibilityFilter, locationFilter]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  // Forms
  const {
    register: registerForm,
    handleSubmit: handleSubmitRegister,
    reset: resetRegisterForm,
    formState: { errors: registerErrors, isSubmitting: isSubmittingRegister },
  } = useForm<RegisterDonorValues>({
    resolver: zodResolver(registerDonorSchema),
    defaultValues: {
      isAvailable: true,
      bloodType: 'A+',
    },
  });

  const {
    register: editForm,
    handleSubmit: handleSubmitEdit,
    reset: resetEditForm,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
  } = useForm<EditDonorValues>({
    resolver: zodResolver(editDonorSchema),
  });

  const handleOpenRegister = () => {
    resetRegisterForm();
    setRegistering(true);
  };

  const onSubmitRegister = async (values: RegisterDonorValues) => {
    try {
      const res = await donorsService.create(values);
      if (res.success) {
        success('Individual donor registered successfully!');
        setRegistering(false);
        fetchDonors();
      } else {
        error(res.message || 'Failed to register donor');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to register donor');
    }
  };

  const handleOpenEdit = (donor: DonorDetail) => {
    setEditingDonor(donor);
    resetEditForm({
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      bloodType: donor.donorProfile?.bloodType?.name || 'A+',
      location: donor.location || 'Kuala Lumpur',
      isAvailable: donor.isAvailable,
      lastDonationDate: donor.donorProfile?.lastDonationDate
        ? new Date(donor.donorProfile.lastDonationDate).toISOString().split('T')[0]
        : '',
    });
  };

  const onSubmitEdit = async (values: EditDonorValues) => {
    if (!editingDonor) return;
    try {
      const res = await donorsService.update(editingDonor.id, values);
      if (res.success) {
        success('Donor details updated successfully!');
        setEditingDonor(null);
        fetchDonors();
      } else {
        error(res.message || 'Failed to update donor');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update donor');
    }
  };

  const handleDeleteDonor = async () => {
    if (!deletingDonor) return;
    try {
      const res = await donorsService.remove(deletingDonor.id);
      if (res.success) {
        success('Donor deleted successfully!');
        setDeletingDonor(null);
        fetchDonors();
      } else {
        error(res.message || 'Failed to delete donor');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to delete donor');
    }
  };

  const getEligibility = (lastDonationDate: string | null) => {
    if (!lastDonationDate) return { eligible: true, label: 'Eligible (No donations yet)' };
    const days = Math.floor((new Date().getTime() - new Date(lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days >= 56) return { eligible: true, label: `Eligible (${days} days elapsed)` };
    return { eligible: false, label: `Ineligible (Need ${56 - days} days recovery)` };
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Donors Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Maintain the global list of active individual blood donors, check eligibility status, and coordinate records.
            </p>
          </div>

          <Button
            onClick={handleOpenRegister}
            className="flex items-center gap-2 font-bold shrink-0 shadow-md bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Register Donor</span>
          </Button>
        </div>

        {/* Filters and search panel */}
        <Card className="shadow-lg border-gray-100 rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search donor by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10 transition-all"
                />
              </div>

              {/* Location filter */}
              <div className="w-full lg:w-60 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by city/location..."
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {/* Blood Type */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Blood Type</label>
                <select
                  value={bloodTypeFilter}
                  onChange={(e) => {
                    setBloodTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white outline-none"
                >
                  <option value="">All Blood Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => {
                    setAvailabilityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white outline-none"
                >
                  <option value="">All Availabilities</option>
                  <option value="true">Available Now</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              {/* Eligibility */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Eligibility Status</label>
                <select
                  value={eligibilityFilter}
                  onChange={(e) => {
                    setEligibilityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white outline-none"
                >
                  <option value="">All Eligibility</option>
                  <option value="eligible">Eligible (56-day Recovery Elapsed)</option>
                  <option value="ineligible">Ineligible (In Recovery Period)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donors Table */}
        <Card className="shadow-lg border-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8"><SkeletonTable /></div>
            ) : donors.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                  <Users className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">No donors found</p>
                  <p className="text-sm text-gray-400">Try registering an individual donor or adjusting filters.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-medium border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 text-[10px] tracking-wider uppercase font-bold">
                        <th className="py-4.5 px-6">Donor Name</th>
                        <th className="py-4.5 px-6">Blood Type</th>
                        <th className="py-4.5 px-6">Availability</th>
                        <th className="py-4.5 px-6">Eligibility</th>
                        <th className="py-4.5 px-6">Last Donation Date</th>
                        <th className="py-4.5 px-6">Location</th>
                        <th className="py-4.5 px-6">Contact Info</th>
                        <th className="py-4.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {donors.map((d) => {
                        const eligibility = getEligibility(d.donorProfile?.lastDonationDate || null);

                        return (
                          <tr key={d.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-4 px-6 font-extrabold text-gray-900">{d.name}</td>

                            {/* Blood Type */}
                            <td className="py-4 px-6">
                              <span className="h-8 w-8 rounded-lg bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 text-xs">
                                {d.donorProfile?.bloodType?.name || 'A+'}
                              </span>
                            </td>

                            {/* Availability */}
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                d.isAvailable
                                  ? 'bg-green-50 text-green-700 border-green-100'
                                  : 'bg-gray-50 text-gray-500 border-gray-100'
                              }`}>
                                {d.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </td>

                            {/* Eligibility */}
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                eligibility.eligible
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {eligibility.eligible ? 'Eligible' : 'Ineligible'}
                              </span>
                            </td>

                            {/* Last Donation Date */}
                            <td className="py-4 px-6 text-xs text-gray-500 font-semibold">
                              {d.donorProfile?.lastDonationDate
                                ? new Date(d.donorProfile.lastDonationDate).toLocaleDateString()
                                : 'No history'}
                            </td>

                            {/* Location */}
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <span>{d.location || 'Kuala Lumpur'}</span>
                              </span>
                            </td>

                            {/* Contact Info */}
                            <td className="py-4 px-6 space-y-0.5">
                              <p className="text-xs text-gray-600 font-bold flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" /> {d.phone}
                              </p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400" /> {d.email}
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingDonor(d)}
                                  className="h-8 px-2 flex items-center gap-1 text-xs font-bold"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="hidden md:inline">View</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEdit(d)}
                                  className="h-8 px-2 flex items-center gap-1 text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  <span className="hidden md:inline">Edit</span>
                                </Button>

                                {isAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeletingDonor(d)}
                                    className="h-8 px-2 flex items-center gap-1 text-xs font-bold text-rose-600 border-rose-100 hover:bg-rose-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="hidden md:inline">Delete</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/40">
                  <p className="text-xs font-semibold text-gray-400">
                    Showing Page <span className="text-gray-700">{meta.page}</span> of{' '}
                    <span className="text-gray-700">{meta.totalPages}</span> ({meta.total} Donors)
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className="px-3 text-xs font-bold"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={meta.page >= meta.totalPages}
                      className="px-3 text-xs font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================= REGISTER MODAL ================= */}
        {registering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Register Individual Donor</h3>
                  <p className="text-xs text-gray-400">Onboard a new blood donor directly onto the Nabz hub</p>
                </div>
                <button onClick={() => setRegistering(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRegister(onSubmitRegister)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      {...registerForm('name')}
                      placeholder="E.g. John Doe"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {registerErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{registerErrors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      {...registerForm('email')}
                      placeholder="E.g. john@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {registerErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{registerErrors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number (International)</label>
                    <input
                      type="text"
                      {...registerForm('phone')}
                      placeholder="E.g. +60123456789"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {registerErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{registerErrors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Initial Password</label>
                    <input
                      type="password"
                      {...registerForm('password')}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {registerErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1">{registerErrors.password.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Blood Type</label>
                    <select
                      {...registerForm('bloodType')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Last Donation Date (Optional)</label>
                    <input
                      type="date"
                      {...registerForm('lastDonationDate')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">City / Location</label>
                    <input
                      type="text"
                      {...registerForm('location')}
                      placeholder="E.g. Kuala Lumpur"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {registerErrors.location && <p className="text-[10px] text-red-500 font-bold mt-1">{registerErrors.location.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Availability Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="isAvailableReg"
                        {...registerForm('isAvailable')}
                        className="h-4 w-4 rounded text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <label htmlFor="isAvailableReg" className="text-xs text-gray-600 font-semibold select-none">
                        Active & Available to Donate
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-50">
                  <Button type="button" variant="outline" size="sm" onClick={() => setRegistering(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700" isLoading={isSubmittingRegister}>
                    Register Donor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= EDIT MODAL ================= */}
        {editingDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Edit Donor Details</h3>
                  <p className="text-xs text-gray-400">Modify donor record parameters</p>
                </div>
                <button onClick={() => setEditingDonor(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      {...editForm('name')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {editErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{editErrors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      {...editForm('email')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {editErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{editErrors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      {...editForm('phone')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {editErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{editErrors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Update Password (Optional)</label>
                    <input
                      type="password"
                      {...editForm('password')}
                      placeholder="Leave blank to keep same"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Blood Type</label>
                    <select
                      {...editForm('bloodType')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Last Donation Date</label>
                    <input
                      type="date"
                      {...editForm('lastDonationDate')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      {...editForm('location')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                    />
                    {editErrors.location && <p className="text-[10px] text-red-500 font-bold mt-1">{editErrors.location.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Availability Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="isAvailableEdit"
                        {...editForm('isAvailable')}
                        className="h-4 w-4 rounded text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <label htmlFor="isAvailableEdit" className="text-xs text-gray-600 font-semibold select-none">
                        Active & Available to Donate
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-50">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingDonor(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700" isLoading={isSubmittingEdit}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= VIEW PROFILE DETAILS MODAL ================= */}
        {viewingDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in duration-200">
              <div className="relative h-28 bg-gradient-to-r from-red-600 to-rose-500 flex items-end p-6">
                <button onClick={() => setViewingDonor(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4 translate-y-6">
                  <div className="h-16 w-16 rounded-full bg-white text-red-600 border-4 border-white font-extrabold flex items-center justify-center text-lg shadow-md">
                    {viewingDonor.donorProfile?.bloodType?.name || 'A+'}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-10 space-y-5">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">{viewingDonor.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-red-400" />
                    <span>{viewingDonor.location || 'Kuala Lumpur'}</span>
                  </p>
                </div>

                <div className="space-y-3.5 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400">AVAILABILITY</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      viewingDonor.isAvailable
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {viewingDonor.isAvailable ? 'Available Now' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400">ELIGIBILITY</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      getEligibility(viewingDonor.donorProfile?.lastDonationDate || null).eligible
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {getEligibility(viewingDonor.donorProfile?.lastDonationDate || null).label}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400">LAST DONATION</span>
                    <span className="font-extrabold text-gray-700">
                      {viewingDonor.donorProfile?.lastDonationDate
                        ? new Date(viewingDonor.donorProfile.lastDonationDate).toLocaleDateString()
                        : 'No records'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400">TOTAL DONATIONS</span>
                    <span className="font-extrabold text-gray-700">
                      {viewingDonor.donorProfile?.totalDonations || 0} times
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                  <p className="font-bold text-gray-400">CONTACT DETAILS</p>
                  <p className="font-extrabold text-gray-800 flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-xl">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" /> {viewingDonor.phone}
                  </p>
                  <p className="font-extrabold text-gray-800 flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-xl">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" /> {viewingDonor.email}
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setViewingDonor(null)} className="w-full font-bold">
                    Close Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        {deletingDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                <AlertTriangle className="h-6 w-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900">Delete Donor?</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Are you sure you want to permanently delete this blood donor user and their profile details? This action cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeletingDonor(null)}>
                  Cancel
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteDonor} className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 font-bold">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
