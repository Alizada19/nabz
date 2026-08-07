'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { bloodRequestsService, QueryBloodRequestDto, CreateBloodRequestDto } from '@/api/bloodRequests';
import { BloodRequest } from '@/api/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
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
  PlusCircle,
  Activity,
  Heart,
  Home,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// Zod schema for editing request
const editRequestSchema = z.object({
  requestType: z.enum(['INDIVIDUAL', 'HOSPITAL', 'BLOOD_BANK']),
  bloodType: z.string().min(1, 'Please select a blood type'),
  hospitalName: z.string().optional().nullable(),
  hospitalAddress: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  unitsRequired: z.number().optional().nullable(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'matched', 'completed', 'cancelled']),
  requesterPhone: z.string().optional().nullable(),
  preferredHospital: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
  coordinatorName: z.string().optional().nullable(),
  coordinatorContact: z.string().optional().nullable(),
});

type EditRequestFormValues = z.infer<typeof editRequestSchema>;

export default function BloodRequestsListPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination & meta
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Edit / Delete modals state
  const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<BloodRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const query: QueryBloodRequestDto = {
        page,
        limit: 10,
      };

      if (searchTerm.trim() !== '') {
        query.search = searchTerm;
      }
      if (statusFilter !== '') {
        query.status = statusFilter;
      }
      if (urgencyFilter !== '') {
        query.urgencyLevel = urgencyFilter;
      }
      if (bloodTypeFilter !== '') {
        query.bloodType = bloodTypeFilter;
      }
      if (locationFilter !== '') {
        query.location = locationFilter;
      }
      if (requestTypeFilter !== '') {
        query.requestType = requestTypeFilter;
      }

      // Fetch all requests central coordination
      const res = await bloodRequestsService.findAll(query);
      if (res.success && res.data) {
        setRequests(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load blood requests:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, urgencyFilter, bloodTypeFilter, locationFilter, requestTypeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  const handleStatusTransition = async (id: string, targetStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await bloodRequestsService.updateStatus(id, targetStatus);
      if (res.success) {
        success(`Successfully changed status to ${targetStatus.toUpperCase()}`);
        fetchRequests();
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update request status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // React Hook Form for Edit Request
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEditForm,
    watch: watchEdit,
    setValue: setValueEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
  } = useForm<EditRequestFormValues>({
    resolver: zodResolver(editRequestSchema),
  });

  const editRequestType = watchEdit('requestType');

  const handleOpenEdit = (request: BloodRequest) => {
    setEditingRequest(request);
    resetEditForm({
      requestType: request.requestType,
      bloodType: request.bloodType?.name || 'A+',
      hospitalName: request.hospitalName || '',
      hospitalAddress: request.hospitalAddress || '',
      latitude: request.latitude || 3.1390,
      longitude: request.longitude || 101.6869,
      unitsRequired: request.unitsRequired || null,
      urgencyLevel: request.urgencyLevel,
      status: request.status,
      requesterPhone: request.requesterPhone || '',
      preferredHospital: request.preferredHospital || '',
      additionalNotes: request.additionalNotes || '',
      coordinatorName: request.coordinatorName || '',
      coordinatorContact: request.coordinatorContact || '',
    });
  };

  const onSubmitEdit = async (values: EditRequestFormValues) => {
    if (!editingRequest) return;
    try {
      const res = await bloodRequestsService.update(editingRequest.id, values);
      if (res.success) {
        success('Blood Request updated successfully!');
        setEditingRequest(null);
        fetchRequests();
      } else {
        error(res.message || 'Failed to update request');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const handleDeleteRequest = async () => {
    if (!deletingRequest) return;
    try {
      const res = await bloodRequestsService.remove(deletingRequest.id);
      if (res.success) {
        success('Blood Request deleted successfully!');
        setDeletingRequest(null);
        fetchRequests();
      } else {
        error(res.message || 'Failed to delete request');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to delete request');
    }
  };

  const isSeeker = user?.role === 'seeker';
  const isHospital = user?.role === 'hospital';
  const isBloodBank = user?.role === 'blood_bank';
  const isAdmin = user?.role === 'admin';
  const canCreate = isSeeker || isHospital || isBloodBank || isAdmin;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Top header block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Central Coordination Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Central matching hub. Any individual, hospital, or blood bank can submit emergency requests.
            </p>
          </div>

          {canCreate && (
            <Button
              onClick={() => router.push('/blood-requests/new')}
              className="flex items-center gap-2 font-bold shrink-0 shadow-md bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Request</span>
            </Button>
          )}
        </div>

        {/* Powerful Interactive Filters Section */}
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
                  placeholder="Search by hospital, address, requester..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10 transition-all"
                />
              </div>

              {/* Location filter input */}
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Request Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Request Type</label>
                <select
                  value={requestTypeFilter}
                  onChange={(e) => {
                    setRequestTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-red-500 bg-white"
                >
                  <option value="">All Request Types</option>
                  <option value="INDIVIDUAL">Individual Seeker</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="BLOOD_BANK">Blood Bank</option>
                </select>
              </div>

              {/* Blood Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Blood Type</label>
                <select
                  value={bloodTypeFilter}
                  onChange={(e) => {
                    setBloodTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-red-500 bg-white"
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

              {/* Urgency Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Urgency</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => {
                    setUrgencyFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-red-500 bg-white"
                >
                  <option value="">All Urgencies</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-red-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="matched">Matched</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests central table/board */}
        <Card className="shadow-lg border-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8"><SkeletonTable /></div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                  <SlidersHorizontal className="h-7 w-7 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">No matching blood requests</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters or coordinates search.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-medium border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 text-[10px] tracking-wider uppercase font-bold">
                        <th className="py-4.5 px-6">Requester</th>
                        <th className="py-4.5 px-6">Blood Type</th>
                        <th className="py-4.5 px-6">Location / Hospital</th>
                        <th className="py-4.5 px-6">Units Required</th>
                        <th className="py-4.5 px-6">Urgency</th>
                        <th className="py-4.5 px-6">Current Status</th>
                        <th className="py-4.5 px-6">Created Date</th>
                        <th className="py-4.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {requests.map((r: any) => {
                        const canCancel = r.status === 'pending' || r.status === 'matched';
                        const canMatch = r.status === 'pending';
                        const canComplete = r.status === 'matched';

                        // Check if owner or admin
                        const isOwner = r.seekerId === user?.id;
                        const hasWritePermissions = isOwner || isAdmin;

                        // Display name details based on requestType
                        const requesterName =
                          r.requestType === 'INDIVIDUAL'
                            ? r.seeker?.name || 'Patient Seeker'
                            : r.hospitalName || 'Organization';

                        const targetLocation =
                          r.requestType === 'INDIVIDUAL'
                            ? r.preferredHospital || r.hospitalAddress || 'Patient Residence'
                            : r.hospitalAddress || 'Organization Address';

                        const roleBadgeColor =
                          r.requestType === 'INDIVIDUAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          r.requestType === 'HOSPITAL' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          'bg-amber-50 text-amber-700 border-amber-100';

                        return (
                          <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                            {/* Requester column */}
                            <td className="py-4 px-6">
                              <p className="font-extrabold text-gray-900">{requesterName}</p>
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 mt-1 rounded-full font-bold border ${roleBadgeColor}`}>
                                {r.requestType}
                              </span>
                            </td>

                            {/* Blood Type */}
                            <td className="py-4 px-6">
                              <span className="h-9 w-9 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 shadow-sm text-sm">
                                {r.bloodType?.name || 'A+'}
                              </span>
                            </td>

                            {/* Location / Hospital */}
                            <td className="py-4 px-6">
                              <p className="font-bold text-gray-900 truncate max-w-[200px]">{targetLocation}</p>
                              {r.requestType !== 'INDIVIDUAL' && r.hospitalAddress && (
                                <span className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[200px] mt-1 font-semibold">
                                  <MapPin className="h-3 w-3 shrink-0 text-red-400" />
                                  <span>{r.hospitalAddress}</span>
                                </span>
                              )}
                            </td>

                            {/* Units */}
                            <td className="py-4 px-6">
                              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                                {r.unitsRequired ? `${r.unitsRequired} bags` : 'Any'}
                              </span>
                            </td>

                            {/* Urgency */}
                            <td className="py-4 px-6">
                              <Badge
                                variant={
                                  r.urgencyLevel === 'critical' || r.urgencyLevel === 'high'
                                    ? 'critical'
                                    : r.urgencyLevel === 'medium'
                                    ? 'warning'
                                    : 'success'
                                }
                              >
                                {r.urgencyLevel}
                              </Badge>
                            </td>

                            {/* Current Status */}
                            <td className="py-4 px-6">
                              <Badge
                                variant={
                                  r.status === 'completed'
                                    ? 'success'
                                    : r.status === 'cancelled'
                                    ? 'neutral'
                                    : r.status === 'matched'
                                    ? 'info'
                                    : 'warning'
                                }
                              >
                                {r.status}
                              </Badge>
                            </td>

                            {/* Created Date */}
                            <td className="py-4 px-6 text-xs text-gray-400 font-medium">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/blood-requests/${r.id}`)}
                                  className="h-8 px-2 flex items-center gap-1 text-xs font-bold text-gray-600"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="hidden md:inline">View</span>
                                </Button>

                                {hasWritePermissions && (
                                  <>
                                    {/* Edit details */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenEdit(r)}
                                      className="h-8 px-2 text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                      <span className="hidden md:inline">Edit</span>
                                    </Button>

                                    {/* Delete request */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDeletingRequest(r)}
                                      className="h-8 px-2 text-xs font-bold text-rose-600 border-rose-100 hover:bg-rose-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span className="hidden md:inline">Delete</span>
                                    </Button>
                                  </>
                                )}

                                {/* Matching / status operations */}
                                {canMatch && hasWritePermissions && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleStatusTransition(r.id, 'matched')}
                                    disabled={updatingId === r.id}
                                    className="h-8 px-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                                  >
                                    <Users className="h-3.5 w-3.5" />
                                    <span>Match</span>
                                  </Button>
                                )}

                                {canComplete && hasWritePermissions && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleStatusTransition(r.id, 'completed')}
                                    disabled={updatingId === r.id}
                                    className="h-8 px-2 text-xs font-bold bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Complete</span>
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

                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/40">
                  <p className="text-xs font-semibold text-gray-400">
                    Showing Page <span className="text-gray-700">{meta.page}</span> of{' '}
                    <span className="text-gray-700">{meta.totalPages}</span> ({meta.total} Total Requests)
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

        {/* ================= EDIT MODAL ================= */}
        {editingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Edit Blood Request</h3>
                  <p className="text-xs text-gray-400">Modify emergency matching broadcast parameters</p>
                </div>
                <button onClick={() => setEditingRequest(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="p-6 space-y-4">

                {/* Requester Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Requester Type</label>
                  <select
                    {...registerEdit('requestType')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="BLOOD_BANK">BLOOD_BANK</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Blood Type Required</label>
                    <select
                      {...registerEdit('bloodType')}
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
                    <label className="block text-xs font-bold text-gray-500 mb-1">Urgency Level</label>
                    <select
                      {...registerEdit('urgencyLevel')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields on Edit form too */}
                {editRequestType === 'INDIVIDUAL' && (
                  <div className="space-y-3.5 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Requester Contact Phone</label>
                        <input
                          type="text"
                          {...registerEdit('requesterPhone')}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Preferred Hospital</label>
                        <input
                          type="text"
                          {...registerEdit('preferredHospital')}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Units Required (Optional)</label>
                      <input
                        type="number"
                        {...registerEdit('unitsRequired', { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                      />
                    </div>
                  </div>
                )}

                {editRequestType !== 'INDIVIDUAL' && (
                  <div className="space-y-3.5 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Organization Name</label>
                        <input
                          type="text"
                          {...registerEdit('hospitalName')}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Units Required</label>
                        <input
                          type="number"
                          {...registerEdit('unitsRequired', { valueAsNumber: true })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Coordinator Name</label>
                        <input
                          type="text"
                          {...registerEdit('coordinatorName')}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Coordinator Contact</label>
                        <input
                          type="text"
                          {...registerEdit('coordinatorContact')}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Organization Address</label>
                      <input
                        type="text"
                        {...registerEdit('hospitalAddress')}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          {...registerEdit('latitude', { valueAsNumber: true })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          {...registerEdit('longitude', { valueAsNumber: true })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Additional Notes</label>
                  <textarea
                    {...registerEdit('additionalNotes')}
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                  <select
                    {...registerEdit('status')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-bold"
                  >
                    <option value="pending">Pending</option>
                    <option value="matched">Matched</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-50">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingRequest(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white" isLoading={isSubmittingEdit}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        {deletingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                <AlertTriangle className="h-6 w-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900">Delete Request?</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Are you sure you want to permanently delete this blood request? This action cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeletingRequest(null)}>
                  No, Keep It
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteRequest} className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 font-bold">
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
