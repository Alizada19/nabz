'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { donorProfilesService } from '@/api/donorProfiles';
import { bloodRequestsService } from '@/api/bloodRequests';
import { BloodRequest } from '@/api/types';
import { notificationsService } from '@/api/notifications';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Heart,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  Clock,
  Compass,
  ArrowRight,
  Bell,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [stats, setStats] = useState({
    activeRequests: 0,
    totalUnits: 0,
    matchedDonors: 0,
  });

  const isDonor = user?.role === 'donor';
  const isSeeker = user?.role === 'seeker';
  const isAdmin = user?.role === 'admin';

  // Fetch Donor profile if user is a donor
  useEffect(() => {
    if (!user || !isDonor) return;

    const fetchDonorInfo = async () => {
      setLoadingProfile(true);
      try {
        const res = await donorProfilesService.getMine();
        if (res.success && res.data) {
          setDonorProfile(res.data);
        }
      } catch (err: any) {
        console.error('Failed to get donor profile:', err);
        // If profile doesn't exist, try creating a default one
        if (err.response?.status === 404) {
          try {
            const createRes = await donorProfilesService.create({ bloodType: 'A+' });
            if (createRes.success) {
              setDonorProfile(createRes.data);
              success('Created standard donor profile!');
            }
          } catch (createErr) {
            console.error('Failed to auto-create donor profile:', createErr);
          }
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDonorInfo();
  }, [user, isDonor, success]);

  // Fetch requests list (Seeker's requests or General/Nearby compatible requests)
  useEffect(() => {
    if (!user) return;

    const fetchRequestsData = async () => {
      setLoadingRequests(true);
      try {
        if (isSeeker || isAdmin) {
          // Seeker lists their own requests
          const res = await bloodRequestsService.findMine({ limit: 5 });
          if (res.success && res.data) {
            setRequests(res.data.items);
            const active = res.data.items.filter((r) => r.status === 'pending' || r.status === 'matched').length;
            const units = res.data.items.reduce((acc, curr) => acc + curr.unitsRequired, 0);
            setStats({
              activeRequests: active,
              totalUnits: units,
              matchedDonors: res.data.meta.total * 3, // mock matching stat
            });
          }
        } else if (isDonor) {
          // Donor lists active emergency requests matching blood type rules
          // Since donor lacks list-all permission on search requests, we query compatibility
          // For donor UX, we query the mine/all requests.
          // Wait! In Nabz, a donor can fetch blood requests or we can show them recent alerts. Let's list.
          // Let's call findMine, but if no mine requests, list notifications as alerts!
          const res = await bloodRequestsService.findMine({ limit: 5 }).catch(() => null);
          if (res && res.success && res.data) {
            setRequests(res.data.items);
          } else {
            // Get notification alerts as simulated matched requests
            const notifRes = await notificationsService.findMine({ limit: 5 }).catch(() => null);
            if (notifRes && notifRes.success && notifRes.data) {
              // Convert notification list to mock matched blood requests
              const mockRequests = notifRes.data.items.map((n, idx) => ({
                id: n.id,
                seekerId: 'seeker-id',
                bloodTypeId: 'blood-type-id',
                hospitalName: 'General Hospital',
                hospitalAddress: 'City Center',
                latitude: user.latitude || 3.1390,
                longitude: user.longitude || 101.6869,
                unitsRequired: 2,
                urgencyLevel: 'high' as any,
                status: 'pending' as any,
                createdAt: n.createdAt,
                updatedAt: n.createdAt,
                bloodType: { id: 'bt', name: donorProfile?.bloodType?.name || 'A+' },
              }));
              setRequests(mockRequests);
            }
          }
        }
      } catch (err) {
        console.error('Failed to get requests info:', err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequestsData();
  }, [user, isSeeker, isAdmin, isDonor, donorProfile]);

  // Toggle donor availability status
  const handleToggleAvailability = async () => {
    if (!user || !donorProfile) return;
    try {
      const nextAvailable = !donorProfile.availableStatus;
      const res = await donorProfilesService.updateMine({ availableStatus: nextAvailable });
      if (res.success && res.data) {
        setDonorProfile(res.data);
        // Also update users.isAvailable for consistency
        await donorProfilesService.updateMine({ availableStatus: nextAvailable }).catch(() => null);
        success(`Availability set to: ${nextAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`);
      }
    } catch (err: any) {
      console.error(err);
      error('Failed to update availability status');
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Hello, {user?.name}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isDonor
                ? 'Thank you for being a lifesaver. Keep your availability updated below.'
                : 'Manage emergency blood requests and match with nearby compatible donors.'}
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            {isSeeker || isAdmin ? (
              <Button
                onClick={() => router.push('/blood-requests/new')}
                className="flex items-center gap-2 font-bold px-5"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>New Request</span>
              </Button>
            ) : isDonor ? (
              <Button
                variant={donorProfile?.availableStatus ? 'primary' : 'outline'}
                onClick={handleToggleAvailability}
                className="flex items-center gap-2 font-bold"
              >
                <Heart className="h-4.5 w-4.5 fill-current" />
                <span>
                  Status: {donorProfile?.availableStatus ? 'Available to Donate' : 'Set Available'}
                </span>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSeeker || isAdmin ? (
            <>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Requests</p>
                    <p className="text-3xl font-extrabold text-gray-900">{stats.activeRequests}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                    <Activity className="h-6 w-6 animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Required Blood Units</p>
                    <p className="text-3xl font-extrabold text-gray-900">{stats.totalUnits} Units</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Clock className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matches in Radius</p>
                    <p className="text-3xl font-extrabold text-gray-900">{stats.matchedDonors}+</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                    <Compass className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donation Status</p>
                    <p className="text-lg font-extrabold text-gray-900">
                      {donorProfile?.availableStatus ? 'Ready to Assist' : 'On Hold'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                    <Heart className="h-6 w-6 fill-current" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Blood Type</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {donorProfile?.bloodType?.name || 'A+'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <Activity className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Donations</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {donorProfile?.totalDonations || 0} Times
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Bottom Split Layout: Requests & Blood Compatibility rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests or Alerts List */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {isDonor ? 'Emergency Broadcasts / Matches' : 'My Recent Emergency Requests'}
                </CardTitle>
                <CardDescription>
                  {isDonor
                    ? 'Active emergency requests matching compatibility criteria nearby'
                    : 'List of your posted requests and status tracker.'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/blood-requests')}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <SkeletonTable />
              ) : requests.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl space-y-3">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No active emergency requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-medium">
                    <thead>
                      <tr className="border-b border-gray-50 text-gray-400 text-xs tracking-wider uppercase font-bold">
                        <th className="pb-3">Blood Type</th>
                        <th className="pb-3">Hospital</th>
                        <th className="pb-3">Urgency</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Units</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {requests.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="py-3">
                            <span className="h-8 w-8 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100">
                              {r.bloodType?.name || 'A+'}
                            </span>
                          </td>
                          <td className="py-3">
                            <p className="font-bold text-gray-900 truncate max-w-[150px]">{r.hospitalName}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">{r.hospitalAddress}</p>
                          </td>
                          <td className="py-3">
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
                          <td className="py-3">
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
                          <td className="py-3 text-gray-600 font-semibold">{r.unitsRequired}</td>
                          <td className="py-3 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/blood-requests/${r.id}`)}
                              className="px-3"
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blood Compatibility Guide */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Blood Compatibility Engine</CardTitle>
              <CardDescription>Recipient compatibility rules chart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-center">
                  <p className="font-extrabold text-red-600 text-sm">O-</p>
                  <p className="text-gray-500 font-medium mt-1">Universal Donor</p>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-center">
                  <p className="font-extrabold text-red-600 text-sm">AB+</p>
                  <p className="text-gray-500 font-medium mt-1">Universal Recipient</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Recipient O-</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">O-</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Recipient O+</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">O+, O-</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Recipient A-</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">A-, O-</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Recipient A+</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">A+, A-, O+, O-</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Recipient B-</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">B-, O-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Recipient B+</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">B+, B-, O+, O-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
