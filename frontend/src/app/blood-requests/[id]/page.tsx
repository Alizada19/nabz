'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { bloodRequestsService } from '@/api/bloodRequests';
import { donorsService } from '@/api/donors';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/dialog';
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Compass,
  AlertCircle,
  Activity,
  Heart,
  UserCheck,
  ChevronLeft,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

export default function BloodRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { user } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);

  // Matched donors state
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState<any[]>([]);
  const [searchRadius, setSearchRadius] = useState(50); // 50km default

  // Status Dialog controls
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bloodRequestsService.findOne(id);
      if (res.success && res.data) {
        setRequest(res.data);
        // Once we have coordinates and blood type, query matching available donors
        fetchMatchingDonors(res.data);
      } else {
        error('Failed to retrieve request details');
      }
    } catch (err) {
      console.error(err);
      error('Error fetching request information');
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  const fetchMatchingDonors = async (reqData: any) => {
    setLoadingDonors(true);
    try {
      const res = await donorsService.findNearby({
        bloodType: reqData.bloodType?.name,
        latitude: reqData.latitude,
        longitude: reqData.longitude,
        radius: searchRadius,
      });
      if (res.success && res.data) {
        setMatchedDonors(res.data.items);
      }
    } catch (err) {
      console.error('Failed to get compatible donors:', err);
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleUpdateStatus = async (status: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await bloodRequestsService.updateStatus(id, status);
      if (res.success && res.data) {
        setRequest(res.data);
        success(`Request marked as ${status.toUpperCase()}!`);
        setConfirmingStatus(null);
      } else {
        error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update request status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isOwner = user?.id === request?.seekerId;
  const isAdmin = user?.role === 'admin';
  const showControls = (isOwner || isAdmin) && (request?.status === 'pending' || request?.status === 'matched');

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to List</span>
        </button>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
            <div className="lg:col-span-1">
              <SkeletonCard />
            </div>
          </div>
        ) : !request ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500 font-semibold">
              No request details found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request Details Core Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          request.urgencyLevel === 'critical' || request.urgencyLevel === 'high'
                            ? 'critical'
                            : request.urgencyLevel === 'medium'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {request.urgencyLevel} Urgency
                      </Badge>
                      <Badge
                        variant={
                          request.status === 'completed'
                            ? 'success'
                            : request.status === 'cancelled'
                            ? 'neutral'
                            : 'warning'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl pt-1">Request for {request.hospitalName}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{request.hospitalAddress}</span>
                    </CardDescription>
                  </div>

                  <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-extrabold flex items-center justify-center text-xl shadow-sm">
                    {request.bloodType?.name || 'A+'}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Bags Needed</p>
                      <p className="text-xl font-extrabold text-gray-900 mt-0.5">{request.unitsRequired} bags</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Posted On</p>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Coordinates</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Section for Seeker/Admin */}
                  {showControls && (
                    <div className="bg-red-50/40 p-5 rounded-2xl border border-red-100/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <p className="text-sm font-bold text-red-950">Update Request Status</p>
                        <p className="text-xs text-gray-500">Manage the status of this emergency search.</p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => setConfirmingStatus('cancelled')}
                          className="flex-1 sm:flex-none flex items-center gap-1 text-gray-600 border-gray-300 font-semibold text-xs py-2"
                        >
                          <XCircle className="h-4 w-4" /> Cancel Search
                        </Button>
                        <Button
                          onClick={() => setConfirmingStatus('completed')}
                          className="flex-1 sm:flex-none flex items-center gap-1 font-bold text-xs py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mark Completed
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Matched Proximity Donors Engine */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="h-5 w-5 text-red-600 animate-spin" />
                      <span>Nearby Compatible Donors Match</span>
                    </CardTitle>
                    <CardDescription>
                      Live real-time geographic calculation of compatible donors in {searchRadius}km radius
                    </CardDescription>
                  </div>
                  {/* Radius adjust selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 shrink-0 uppercase">Radius</span>
                    <select
                      value={searchRadius}
                      onChange={(e) => {
                        const nextRad = Number(e.target.value);
                        setSearchRadius(nextRad);
                        fetchMatchingDonors({ ...request, radius: nextRad });
                      }}
                      className="text-xs font-semibold px-2 py-1 bg-gray-50 rounded border border-gray-200"
                    >
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingDonors ? (
                    <SkeletonTable />
                  ) : matchedDonors.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl space-y-2">
                      <div className="h-10 w-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">No available compatible donors found in radius</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm font-medium">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">
                            <th className="pb-3 pr-4">Donor Name</th>
                            <th className="pb-3 pr-4">Blood Type</th>
                            <th className="pb-3 pr-4">Approximate Distance</th>
                            <th className="pb-3 pr-4">City / Area</th>
                            <th className="pb-3 text-right">Available Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {matchedDonors.map((d, index) => (
                            <tr key={index} className="hover:bg-gray-50/30">
                              <td className="py-3 pr-4 font-bold text-gray-900">{d.name}</td>
                              <td className="py-3 pr-4">
                                <span className="h-6 w-6 rounded-lg bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 text-xs">
                                  {d.bloodType}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-gray-600 font-bold flex items-center gap-1.5">
                                <Compass className="h-4 w-4 text-rose-500 shrink-0" />
                                <span>~ {d.distanceKm.toFixed(1)} km</span>
                              </td>
                              <td className="py-3 pr-4 text-xs text-gray-400 font-medium">{d.location || 'Unknown'}</td>
                              <td className="py-3 text-right">
                                <Badge variant={d.isAvailable ? 'success' : 'neutral'}>
                                  {d.isAvailable ? 'Available' : 'Busy'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Blood compatibility overview & notes */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Seekers Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs leading-relaxed text-gray-600">
                  <p>
                    To ensure the privacy of our blood donors, exact locations and contact phone numbers are hidden.
                  </p>
                  <p className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-100 font-medium">
                    Matched donors are automatically sent instant push alerts & system notifications detailing the emergency hospital location.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Confirmation Dialog for Cancel/Complete */}
        <ConfirmDialog
          isOpen={confirmingStatus !== null}
          onClose={() => setConfirmingStatus(null)}
          onConfirm={() => confirmingStatus && handleUpdateStatus(confirmingStatus)}
          title={`Confirm status change to ${confirmingStatus}`}
          description={`Are you absolutely sure you want to change the request status to ${confirmingStatus}? This action cannot be undone.`}
          confirmText={`Yes, ${confirmingStatus}`}
          confirmVariant={confirmingStatus === 'cancelled' ? 'danger' : 'primary'}
          isConfirming={isUpdatingStatus}
        />
      </div>
    </SidebarLayout>
  );
}
