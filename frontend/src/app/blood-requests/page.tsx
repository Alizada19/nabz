'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { bloodRequestsService, QueryBloodRequestDto } from '@/api/bloodRequests';
import { BloodRequest } from '@/api/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function BloodRequestsListPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters & query parameters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const query: QueryBloodRequestDto = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (searchTerm.trim() !== '') {
        query.search = searchTerm;
      }

      if (statusFilter !== '') {
        query.status = statusFilter;
      }

      const res = await bloodRequestsService.findMine(query);
      if (res.success && res.data) {
        setRequests(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load blood requests:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, sortBy, sortOrder]);

  // Load request list on page or filters change
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  const isSeeker = user?.role === 'seeker';
  const isAdmin = user?.role === 'admin';

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Top title and trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Blood Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse emergency blood requests, verify matching statuses and view details.
            </p>
          </div>

          {(isSeeker || isAdmin) && (
            <Button
              onClick={() => router.push('/blood-requests/new')}
              className="flex items-center gap-2 font-bold shrink-0"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Request</span>
            </Button>
          )}
        </div>

        {/* Filters and search panel */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by hospital name or address..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10"
              />
            </div>

            {/* Status filtering dropdown */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[size:1.25rem] bg-[position:right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="matched">Matched</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="w-full md:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as any);
                  setPage(1);
                }}
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[size:1.25rem] bg-[position:right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="unitsRequired-desc">Most Units Required</option>
                <option value="unitsRequired-asc">Least Units Required</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table card */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <SkeletonTable />
            ) : requests.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <SlidersHorizontal className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900">No requests found</p>
                  <p className="text-xs text-gray-400">Try adjusting your filters or search criteria.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs tracking-wider uppercase font-bold">
                        <th className="pb-3 pr-4">Blood Type</th>
                        <th className="pb-3 pr-4">Hospital Name & Address</th>
                        <th className="pb-3 pr-4">Urgency Level</th>
                        <th className="pb-3 pr-4">Required (Bags)</th>
                        <th className="pb-3 pr-4">Current Status</th>
                        <th className="pb-3 pr-4">Created Date</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {requests.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/40">
                          <td className="py-4 pr-4">
                            <span className="h-9 w-9 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 shadow-sm text-sm">
                              {r.bloodType?.name || 'A+'}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="font-bold text-gray-900 truncate max-w-[200px]">{r.hospitalName}</p>
                            <span className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[200px] mt-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>{r.hospitalAddress}</span>
                            </span>
                          </td>
                          <td className="py-4 pr-4">
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
                          <td className="py-4 pr-4 text-gray-600 font-bold">{r.unitsRequired}</td>
                          <td className="py-4 pr-4">
                            <Badge
                              variant={
                                r.status === 'completed'
                                  ? 'success'
                                  : r.status === 'cancelled'
                                  ? 'neutral'
                                  : 'warning'
                              }
                            >
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-4 pr-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/blood-requests/${r.id}`)}
                              className="font-bold"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
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
                      className="px-3"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={meta.page >= meta.totalPages}
                      className="px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
