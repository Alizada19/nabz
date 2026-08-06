'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { hospitalsService, Hospital, CreateHospitalDto } from '@/api/hospitals';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/auth';
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';

export default function HospitalsListPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(3.139);
  const [longitude, setLongitude] = useState(101.6869);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hospitalsService.findAll({
        search: searchTerm,
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setHospitals(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleOpenCreateModal = () => {
    setEditingHospital(null);
    setName('');
    setAddress('');
    setLatitude(3.139);
    setLongitude(101.6869);
    setPhone('');
    setEmail('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h: Hospital) => {
    setEditingHospital(h);
    setName(h.name);
    setAddress(h.address);
    setLatitude(h.latitude);
    setLongitude(h.longitude);
    setPhone(h.phone);
    setEmail(h.email);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !phone || !email) {
      error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const dto: CreateHospitalDto = {
        name,
        address,
        latitude,
        longitude,
        phone,
        email,
      };

      if (editingHospital) {
        const res = await hospitalsService.update(editingHospital.id, dto);
        if (res.success) {
          success('Hospital updated successfully!');
          setIsModalOpen(false);
          fetchHospitals();
        }
      } else {
        const res = await hospitalsService.create(dto);
        if (res.success) {
          success('Hospital created successfully!');
          setIsModalOpen(false);
          fetchHospitals();
        }
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save hospital details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this hospital directory listing?')) return;

    try {
      const res = await hospitalsService.delete(id);
      if (res.success) {
        success('Hospital deleted successfully');
        fetchHospitals();
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to delete hospital');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hospitals Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse, register, and update medical center coordinates and dropoff contact points.
            </p>
          </div>

          {isAdmin && (
            <Button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 font-bold shrink-0"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Hospital</span>
            </Button>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by medical center name or dropoff address..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* List table */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <SkeletonTable />
            ) : hospitals.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <SlidersHorizontal className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900">No hospitals found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search criteria.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs tracking-wider uppercase font-bold">
                        <th className="pb-3 pr-4">Medical Center</th>
                        <th className="pb-3 pr-4">Dropoff Address</th>
                        <th className="pb-3 pr-4">Contact Phone</th>
                        <th className="pb-3 pr-4">Authorized Email</th>
                        <th className="pb-3 pr-4">Coordinates (GPS)</th>
                        {isAdmin && <th className="pb-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {hospitals.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50/40">
                          <td className="py-4 pr-4 font-bold text-gray-900">{h.name}</td>
                          <td className="py-4 pr-4">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold max-w-[220px] truncate">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span>{h.address}</span>
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span>{h.phone}</span>
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span>{h.email}</span>
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                              <Navigation className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                              <span>{h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</span>
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditModal(h)}
                                  className="h-8 w-8 p-0"
                                  title="Edit Hospital details"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(h.id)}
                                  className="h-8 w-8 p-0 hover:bg-rose-50 border-rose-100"
                                  title="Delete Hospital entry"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-400">
                    Showing Page <span className="text-gray-700">{meta.page}</span> of{' '}
                    <span className="text-gray-700">{meta.totalPages}</span> ({meta.total} Medical Centers)
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

        {/* Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="bg-red-50/10 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-lg">
                  {editingHospital ? 'Modify Hospital Registration' : 'Register New Medical Center'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Input
                  label="Hospital Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. General Hospital Kuala Lumpur"
                />

                <Input
                  label="Full Physical Dropoff Address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, City, Area postal code"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  />

                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Contact Phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+601..."
                  />

                  <Input
                    label="Authorized Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@hospital.com"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="font-bold px-5"
                    isLoading={submitting}
                  >
                    {editingHospital ? 'Save Updates' : 'Add Medical Center'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
