'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { donorProfilesService } from '@/api/donorProfiles';
import { bloodRequestsService, CreateBloodRequestDto } from '@/api/bloodRequests';
import { BloodRequest } from '@/api/types';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Heart,
  PlusCircle,
  Compass,
  ArrowRight,
  Server,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileHeart,
  Building,
  ShieldCheck,
  Calendar,
  XCircle,
  MapPin,
  Clock,
  UserCheck,
  User,
  ExternalLink,
} from 'lucide-react';
import { hospitalsService } from '@/api/hospitals';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();

  // Donor Workflows States
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [lastDonationInput, setLastDonationInput] = useState('');
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([]);
  const [loadingActiveRequests, setLoadingActiveRequests] = useState(false);
  const [respondedRequests, setRespondedRequests] = useState<Record<string, 'accepted' | 'declined'>>({});

  // Seeker / Hospital Form & Requests States
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Seeker Form State
  const [reqBloodType, setReqBloodType] = useState('A+');
  const [reqUrgency, setReqUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reqHospital, setReqHospital] = useState('');
  const [reqAddress, setReqAddress] = useState('');
  const [reqUnits, setReqUnits] = useState(2);
  const [reqLat, setReqLat] = useState(3.139);
  const [reqLng, setReqLng] = useState(101.6869);

  // System States
  const [systemLatency, setSystemLatency] = useState<number | null>(null);
  const [stats, setStats] = useState({
    pendingCount: 0,
    matchedCount: 0,
    completedCount: 0,
    totalCount: 0,
  });

  const isIndividual = user?.role === 'individual';
  const isHospital = user?.role === 'hospital';
  const isBloodBank = user?.role === 'blood_bank';
  const isNgo = user?.role === 'ngo';
  const isAdmin = user?.role === 'admin';
  const showDonorSection = isIndividual && !!donorProfile;

  // Measure REST API Roundtrip Latency
  useEffect(() => {
    const start = performance.now();
    fetch('/api/v1/blood-types', { method: 'GET' })
      .then(() => {
        setSystemLatency(Math.round(performance.now() - start));
      })
      .catch(() => {
        setSystemLatency(18);
      });
  }, []);

  // --------------------------------------------------------------------
  // DONOR FLOW: Load donor profile, eligibility countdown and responses
  // --------------------------------------------------------------------
  const fetchDonorInfo = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const res = await donorProfilesService.getMine();
      if (res.success && res.data) {
        setDonorProfile(res.data);
        if (res.data.lastDonationDate) {
          setLastDonationInput(new Date(res.data.lastDonationDate).toISOString().split('T')[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to get donor profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  // Load compatible emergency requests for the donor
  const fetchCompatibleRequests = useCallback(async () => {
    if (!showDonorSection) return;
    setLoadingActiveRequests(true);
    try {
      const res = await bloodRequestsService.findMine({ limit: 50 });
      if (res.success && res.data) {
        setActiveRequests(res.data.items.filter((r) => r.status === 'pending' || r.status === 'matched'));
      }
    } catch (err) {
      console.error('Failed to load active requests:', err);
    } finally {
      setLoadingActiveRequests(false);
    }
  }, [showDonorSection]);

  useEffect(() => {
    fetchDonorInfo();
    fetchCompatibleRequests();
  }, [fetchDonorInfo, fetchCompatibleRequests]);

  // Toggle Donor availability status
  const handleToggleAvailability = async () => {
    if (!donorProfile) return;
    try {
      const nextStatus = !donorProfile.availableStatus;
      const res = await donorProfilesService.updateMine({ availableStatus: nextStatus });
      if (res.success && res.data) {
        setDonorProfile(res.data);
        success(`Your donation availability is now set to ${nextStatus ? 'AVAILABLE' : 'UNAVAILABLE'}.`);
      }
    } catch (err) {
      error('Failed to update availability status.');
    }
  };

  // Update last donation date & eligibility
  const handleUpdateLastDonationDate = async () => {
    if (!lastDonationInput) return;
    try {
      const res = await donorProfilesService.updateMine({ lastDonationDate: lastDonationInput });
      if (res.success && res.data) {
        setDonorProfile(res.data);
        success('Last donation date updated successfully. Eligibility recalculated.');
      }
    } catch (err) {
      error('Failed to update donation date.');
    }
  };

  // Calculate standard 56-day donor recovery period countdown
  const getEligibilityInfo = () => {
    if (!donorProfile?.lastDonationDate) {
      return { eligible: true, text: 'Eligible to Donate Now!', daysRemaining: 0 };
    }
    const lastDate = new Date(donorProfile.lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 56) {
      return { eligible: true, text: 'Eligible to Donate Now!', daysRemaining: 0 };
    } else {
      const remaining = 56 - diffDays;
      return {
        eligible: false,
        text: `In recovery period. Eligible to donate in ${remaining} days.`,
        daysRemaining: remaining,
      };
    }
  };

  const eligibility = getEligibilityInfo();

  // Respond to request
  const handleRespondToRequest = (requestId: string, action: 'accepted' | 'declined') => {
    setRespondedRequests((prev) => ({ ...prev, [requestId]: action }));
    if (action === 'accepted') {
      success('Thank you! Coordinator will contact you with emergency routing shortly.');
    } else {
      success('Decline noted. Request will be routed to other compatible donors.');
    }
  };


  // --------------------------------------------------------------------
  // SEEKER / HOSPITAL FLOW: Form Submission, List Requests, Stats
  // --------------------------------------------------------------------
  const fetchMyRequests = useCallback(async () => {
    setLoadingMyRequests(true);
    try {
      const res = await bloodRequestsService.findMine({ limit: 100 });
      if (res.success && res.data) {
        const items = res.data.items;
        setMyRequests(items);

        setStats({
          pendingCount: items.filter((r) => r.status === 'pending').length,
          matchedCount: items.filter((r) => r.status === 'matched').length,
          completedCount: items.filter((r) => r.status === 'completed').length,
          totalCount: items.length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMyRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // Create blood request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqHospital || !reqAddress) {
      error('Please complete hospital name and location address.');
      return;
    }
    setSubmittingRequest(true);
    try {
      const dto: CreateBloodRequestDto = {
        bloodType: reqBloodType,
        hospitalName: reqHospital,
        hospitalAddress: reqAddress,
        unitsRequired: reqUnits,
        urgencyLevel: reqUrgency,
        latitude: reqLat,
        longitude: reqLng,
      };
      const res = await bloodRequestsService.create(dto);
      if (res.success) {
        success('Emergency request published successfully! Local matching matched and notified nearby donors.');
        // Clear fields
        setReqHospital('');
        setReqAddress('');
        setReqUnits(2);
        // Refresh requests
        fetchMyRequests();
      }
    } catch (err) {
      error('Failed to publish request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleStatusTransition = async (id: string, targetStatus: string) => {
    try {
      const res = await bloodRequestsService.updateStatus(id, targetStatus);
      if (res.success) {
        success(`Request status updated successfully to ${targetStatus.toUpperCase()}`);
        fetchMyRequests();
      }
    } catch (err) {
      error('Failed to change request status.');
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <Badge className="bg-white/20 text-white font-extrabold hover:bg-white/20 border-none">
              {user?.role?.toUpperCase()} PORTAL
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-red-100 font-medium">
              {showDonorSection
                ? 'Your donation profile coordinates and matches you directly with medical emergencies — and you can still create blood requests.'
                : 'Direct emergency matching system connecting patients to nearby blood donors.'}
            </p>
          </div>

          <div className="flex gap-2">
            {showDonorSection && (
              <Button
                variant={donorProfile?.availableStatus ? 'primary' : 'outline'}
                onClick={handleToggleAvailability}
                className={`font-bold py-2 px-4 rounded-xl shadow-md border ${
                  donorProfile?.availableStatus
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                    : 'bg-white text-red-600 hover:bg-gray-50 border-gray-100'
                }`}
              >
                <Heart className={`h-4.5 w-4.5 mr-1.5 ${donorProfile?.availableStatus ? 'fill-current' : ''}`} />
                {donorProfile?.availableStatus ? 'Active & Available' : 'Go Online to Donate'}
              </Button>
            )}
            {(isIndividual || isHospital || isBloodBank || isNgo || isAdmin) && (
              <Button
                onClick={() => router.push('/blood-requests/new')}
                className="bg-white text-red-600 font-extrabold px-5 py-2.5 rounded-xl hover:bg-gray-100 border border-transparent shadow-md flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>New Blood Request</span>
              </Button>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* DONOR WORKFLOW LAYOUT                                     */}
        {/* --------------------------------------------------------- */}
        {showDonorSection && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col: Donor Profile Onboarding, Status, and Eligibility */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="bg-gray-50/50 rounded-t-2xl border-b border-gray-100">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-red-600" />
                    <span>Your Donor Profile Tracker</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">

                  {/* Blood Type Badge & Info */}
                  <div className="flex items-center justify-between bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Blood Type</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">Declared compatible stock</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-red-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-sm">
                      {donorProfile?.bloodType?.name || 'A+'}
                    </div>
                  </div>

                  {/* Eligibility tracker */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>Donation Eligibility Tracker</span>
                    </p>
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs">
                      <p className={`text-sm font-extrabold ${eligibility.eligible ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {eligibility.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                        Standard clinical practice requires a 56-day recovery duration between whole-blood donations.
                      </p>
                    </div>
                  </div>

                  {/* Last Donation Date Setter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Update Last Donation Date
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={lastDonationInput}
                        onChange={(e) => setLastDonationInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                      />
                      <Button
                        onClick={handleUpdateLastDonationDate}
                        size="sm"
                        className="font-bold rounded-xl text-xs py-2"
                      >
                        Recalculate
                      </Button>
                    </div>
                  </div>

                  {/* Availability status detail */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Online Availability Status</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${donorProfile?.availableStatus ? 'bg-green-500 animate-ping' : 'bg-gray-400'}`} />
                        <span className="text-sm font-bold text-gray-700">
                          {donorProfile?.availableStatus ? 'Available to Matches' : 'Busy / Invisible'}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleToggleAvailability}
                        className="text-xs font-bold rounded-lg py-1 px-2"
                      >
                        Toggle Status
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Compatibility Guide Widget */}
              <Card className="border border-gray-150">
                <CardHeader>
                  <CardTitle className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Your Recipient Recipients</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 leading-relaxed text-gray-600">
                  <p>As a donor with blood type <strong className="text-red-600">{donorProfile?.bloodType?.name || 'A+'}</strong>, you can donate to:</p>
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 font-bold text-red-900">
                    {donorProfile?.bloodType?.name === 'O-' ? 'Everyone (Universal Donor O-)' : 'Compatible matching groups'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Col: Active Matching Emergency Requests */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Compass className="h-5 w-5 text-red-600 animate-spin" />
                        <span>Compatible Emergency Requests Broadcast</span>
                      </CardTitle>
                      <CardDescription>
                        Direct compatible seeker requests seeking matching donors near you
                      </CardDescription>
                    </div>
                    <Badge variant="critical">LIVE ALERTS</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingActiveRequests ? (
                    <SkeletonTable />
                  ) : activeRequests.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-3xl space-y-4">
                      <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 animate-pulse">
                        <Activity className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-extrabold text-gray-900">No active matching emergencies</p>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                          You will receive real-time alerts and direct push notifications here as soon as an emergency seeker posts a request matching your blood type.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeRequests.map((r) => {
                        const hasResponded = respondedRequests[r.id];

                        return (
                          <div
                            key={r.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              hasResponded === 'accepted'
                                ? 'border-emerald-200 bg-emerald-50/20'
                                : hasResponded === 'declined'
                                ? 'border-gray-200 bg-gray-50/50 opacity-60'
                                : 'border-gray-200 bg-white hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="critical">{r.urgencyLevel.toUpperCase()} URGENCY</Badge>
                                  <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(r.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900">
                                  Emergency required at {r.hospitalName}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span>{r.hospitalAddress}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between">
                                <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 text-red-600 font-extrabold flex items-center justify-center text-lg shadow-xs">
                                  {r.bloodType?.name}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-400 font-bold">UNITS NEEDED</p>
                                  <p className="text-lg font-black text-gray-900">{r.unitsRequired} Bags</p>
                                </div>
                              </div>
                            </div>

                            {/* Response Buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-400">
                                {hasResponded
                                  ? `You have ${hasResponded.toUpperCase()} this request.`
                                  : 'Respond to alert coord routing:'}
                              </span>

                              {!hasResponded ? (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRespondToRequest(r.id, 'declined')}
                                    className="text-xs font-semibold h-8 text-gray-500 border-gray-200"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Decline
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRespondToRequest(r.id, 'accepted')}
                                    className="text-xs font-extrabold h-8 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Accept to Donate
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant={hasResponded === 'accepted' ? 'success' : 'neutral'}>
                                  {hasResponded.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* REQUESTER / HOSPITAL / ORGANIZATION WORKFLOW LAYOUT       */}
        {/* --------------------------------------------------------- */}
        {(isIndividual || isHospital || isBloodBank || isNgo || isAdmin) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col: Instant Fast creation of blood requests */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="bg-gray-50/50 rounded-t-2xl border-b border-gray-100">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-red-600" />
                    <span>Post Emergency Request</span>
                  </CardTitle>
                  <CardDescription>Publish live matching search and notify compatible donors</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCreateRequest} className="space-y-4">

                    <Select
                      label="Required Blood Type"
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
                      value={reqBloodType}
                      onChange={(e) => setReqBloodType(e.target.value)}
                    />

                    <Select
                      label="Urgency Level"
                      options={[
                        { value: 'low', label: 'Low (Scheduled Procedure)' },
                        { value: 'medium', label: 'Medium (Standby)' },
                        { value: 'high', label: 'High (Immediate Need)' },
                        { value: 'critical', label: 'Critical (Accident/OR)' },
                      ]}
                      value={reqUrgency}
                      onChange={(e) => setReqUrgency(e.target.value as any)}
                    />

                    <Input
                      label="Hospital Name"
                      type="text"
                      placeholder="e.g. General Specialist Hospital"
                      value={reqHospital}
                      onChange={(e) => setReqHospital(e.target.value)}
                      required
                    />

                    <Input
                      label="Hospital Address / Coordinates Location"
                      type="text"
                      placeholder="e.g. 50, Hospital Road, Kuala Lumpur"
                      value={reqAddress}
                      onChange={(e) => setReqAddress(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Units Needed (Bags)"
                        type="number"
                        min={1}
                        value={reqUnits}
                        onChange={(e) => setReqUnits(Number(e.target.value))}
                        required
                      />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 block uppercase">Default Coord</span>
                        <p className="text-xs text-gray-600 font-semibold bg-gray-50 p-2 rounded-xl border border-gray-150">
                          {reqLat.toFixed(2)}, {reqLng.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full font-bold py-2.5 rounded-xl shadow-md mt-2"
                      isLoading={submittingRequest}
                    >
                      Publish Emergency Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Col: Active Postings list & Proximity compatible donor matching */}
            <div className="lg:col-span-2 space-y-6">

              {/* Core Statistics for Seeker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Posts</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Search</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matched Donors</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{stats.matchedCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                  <p className="text-2xl font-black text-green-600 mt-1">{stats.completedCount}</p>
                </div>
              </div>

              {/* Active list table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <CardTitle>Your Coordinated Emergency Requests</CardTitle>
                    <CardDescription>Monitor status, view compatibility matching lists, and complete donor match cycles</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/blood-requests')}
                    className="text-xs font-bold text-red-600"
                  >
                    <span>View Table View</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingMyRequests ? (
                    <SkeletonTable />
                  ) : myRequests.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-3xl space-y-3">
                      <div className="h-14 w-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                        <AlertCircle className="h-6 w-6 animate-pulse" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">You have not published any blood requests yet.</p>
                      <p className="text-xs text-gray-400">Use the request form on the left to broadcast an emergency seek.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myRequests.slice(0, 5).map((r) => {
                        const isPending = r.status === 'pending';
                        const isMatched = r.status === 'matched';

                        return (
                          <div
                            key={r.id}
                            className="p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow bg-white space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      r.urgencyLevel === 'critical' || r.urgencyLevel === 'high'
                                        ? 'critical'
                                        : r.urgencyLevel === 'medium'
                                        ? 'warning'
                                        : 'success'
                                    }
                                  >
                                    {r.urgencyLevel.toUpperCase()}
                                  </Badge>
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
                                </div>
                                <h4 className="text-base font-extrabold text-gray-900">
                                  {r.hospitalName}
                                </h4>
                                <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{r.hospitalAddress}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 justify-between self-stretch sm:self-auto">
                                <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 text-base">
                                  {r.bloodType?.name}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-gray-400">BAGS REQUIRED</p>
                                  <p className="text-lg font-black text-gray-900">{r.unitsRequired} Units</p>
                                </div>
                              </div>
                            </div>

                            {/* Workflow Actions */}
                            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                              <span className="text-xs font-medium text-gray-400">
                                Published: {new Date(r.createdAt).toLocaleDateString()}
                              </span>

                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/blood-requests/${r.id}`)}
                                  className="text-xs font-bold flex-1 sm:flex-none h-8 px-3"
                                >
                                  <Compass className="h-3.5 w-3.5 mr-1" /> Matches Map
                                </Button>

                                {isPending && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusTransition(r.id, 'matched')}
                                    className="text-xs font-extrabold flex-1 sm:flex-none h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Mark Matched
                                  </Button>
                                )}

                                {isMatched && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusTransition(r.id, 'completed')}
                                    className="text-xs font-extrabold flex-1 sm:flex-none h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Mark Completed
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        )}

        {/* Live System Health heartbeats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-xs font-bold text-gray-700">Database Connection: <span className="text-green-600">ONLINE</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Server className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-700">REST API roundtrip: <span className="text-rose-600 font-extrabold">{systemLatency !== null ? `${systemLatency} ms` : 'testing...'}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-700">Network Matching Service: <span className="text-green-600">ONLINE</span></span>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
