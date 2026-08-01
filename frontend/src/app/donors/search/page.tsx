'use client';

import React, { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { donorsService } from '@/api/donors';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { Search, Compass, MapPin, Navigation, Info, ShieldAlert } from 'lucide-react';

export default function FindDonorsPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [bloodType, setBloodType] = useState('A+');
  const [latitude, setLatitude] = useState(3.139);
  const [longitude, setLongitude] = useState(101.6869);
  const [radius, setRadius] = useState(50);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Automatically fetch from profile coordinates on mount
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setLatitude(user.latitude);
      setLongitude(user.longitude);
    }
  }, [user]);

  const detectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        success('Current coordinates populated successfully!');
        setDetectingLocation(false);
      },
      (err) => {
        console.error(err);
        error('Failed to get location automatically.');
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await donorsService.findNearby({
        bloodType,
        latitude,
        longitude,
        radius,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setDonors(res.data.items);
        setMeta(res.data.meta);
        success(`Search completed! Found ${res.data.meta.total} compatible donor(s).`);
      } else {
        error(res.message || 'No compatible donors found');
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to search nearby donors');
    } finally {
      setLoading(false);
    }
  };

  // Perform initial search on mount
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">On-Demand Donor Finder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search nearby active compatible blood donors by matching blood group type and geographic distance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Inputs Card */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Search Criteria</CardTitle>
              <CardDescription>Adjust variables to calculate proximity matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <Select
                  label="Target Blood Type"
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
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700 tracking-wide">Base GPS Location</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      className="text-xs font-semibold py-1 h-7"
                      isLoading={detectingLocation}
                    >
                      <Navigation className="h-3 w-3 mr-1" /> My Location
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Latitude"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    />

                    <Input
                      label="Longitude"
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <Select
                  label="Search Radius"
                  options={[
                    { value: '10', label: '10 Kilometers' },
                    { value: '25', label: '25 Kilometers' },
                    { value: '50', label: '50 Kilometers' },
                    { value: '100', label: '100 Kilometers' },
                    { value: '250', label: '250 Kilometers' },
                  ]}
                  value={radius.toString()}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                />

                <Button type="submit" className="w-full font-bold flex items-center justify-center gap-2 pt-2.5 pb-2.5 rounded-xl" isLoading={loading}>
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Nearby</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Compatible Donors Match List</CardTitle>
              <CardDescription>
                Available active compatible donors in radius sorted by nearest distance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable />
              ) : donors.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl space-y-3">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
                    <Compass className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-500">No compatible donors found in radius</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Try expanding your search radius or selecting compatible transfusion blood types.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-medium">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-xs tracking-wider uppercase font-bold">
                          <th className="pb-3 pr-4">Donor Name</th>
                          <th className="pb-3 pr-4">Blood Group</th>
                          <th className="pb-3 pr-4">Approx Distance</th>
                          <th className="pb-3 pr-4">City / Area</th>
                          <th className="pb-3 text-right">Availability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {donors.map((d, index) => (
                          <tr key={index} className="hover:bg-gray-50/50">
                            <td className="py-4 pr-4 font-bold text-gray-900">{d.name}</td>
                            <td className="py-4 pr-4">
                              <span className="h-7 w-7 rounded-lg bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 text-xs">
                                {d.bloodType}
                              </span>
                            </td>
                            <td className="py-4 pr-4 font-bold text-gray-700 flex items-center gap-1.5">
                              <Compass className="h-4 w-4 text-rose-500 shrink-0" />
                              <span>{d.distanceKm.toFixed(1)} km</span>
                            </td>
                            <td className="py-4 pr-4 text-xs text-gray-400 font-semibold">{d.location || 'Unknown'}</td>
                            <td className="py-4 text-right">
                              <Badge variant={d.isAvailable ? 'success' : 'neutral'}>
                                {d.isAvailable ? 'Available' : 'Busy'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-400">
                      Showing Page <span className="text-gray-700">{meta.page}</span> of{' '}
                      <span className="text-gray-700">{meta.totalPages}</span> ({meta.total} matched donors)
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                        disabled={page >= meta.totalPages}
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

        {/* Security & privacy warning */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-900 uppercase tracking-wider">Privacy & Security Guard</p>
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              This platform adheres strictly to health privacy laws. Donor email addresses, full exact GPS coordinates, and telephone contact details are protected and are NEVER returned in any API responses. Display names are automatically masked (e.g. &quot;Ahmad Zulkifli&quot; &rarr; &quot;Ahmad Z.&quot;) to protect donor identities.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
