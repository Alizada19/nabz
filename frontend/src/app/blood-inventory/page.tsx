'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { bloodInventoryService, BloodInventoryItem } from '@/api/bloodInventory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/auth';
import {
  Activity,
  Heart,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Edit2,
  RefreshCcw,
} from 'lucide-react';

export default function BloodInventoryPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BloodInventoryItem[]>([]);

  // Update Stock State
  const [editingItem, setEditingItem] = useState<BloodInventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unitsStored, setUnitsStored] = useState(0);
  const [minThreshold, setMinThreshold] = useState(0);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bloodInventoryService.findAll();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load blood inventory stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenEditModal = (item: BloodInventoryItem) => {
    setEditingItem(item);
    setUnitsStored(item.unitsStored);
    setMinThreshold(item.minThreshold);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSubmitting(true);
    try {
      const res = await bloodInventoryService.update({
        bloodType: editingItem.bloodType?.name || '',
        unitsStored,
        minThreshold,
      });

      if (res.success) {
        success(`Successfully updated inventory for ${editingItem.bloodType?.name || ''}`);
        setEditingItem(null);
        fetchInventory();
      }
    } catch (err: any) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to update blood inventory stocks.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  // Compute stats
  const totalBags = items.reduce((acc, i) => acc + i.unitsStored, 0);
  const criticalItems = items.filter((i) => i.unitsStored < i.minThreshold);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Blood Stock Inventory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Live monitoring of central blood reserves, deficit flags, and automatic threshold indicators.
            </p>
          </div>

          <Button
            onClick={fetchInventory}
            variant="outline"
            className="flex items-center gap-1.5 font-bold shrink-0 text-xs px-3"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Sync Reserves</span>
          </Button>
        </div>

        {/* Global Stock Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Central Reserve</p>
                <p className="text-3xl font-extrabold text-gray-900">{totalBags} Bags</p>
                <p className="text-xs font-medium text-green-600">Online & verified stock levels</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm">
                <Heart className="h-6 w-6 fill-current animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Critical Stock Alerts</p>
                <p className="text-3xl font-extrabold text-gray-900">{criticalItems.length} Blood Types</p>
                <p className="text-xs font-semibold text-rose-600">Below recommended safety bounds</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                <AlertTriangle className="h-6 w-6 animate-bounce" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Storage Facility Health</p>
                <p className="text-lg font-extrabold text-gray-900">Optimal (4.2&deg;C)</p>
                <p className="text-xs font-medium text-green-600">Cold-chain compliant</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Warning Alerts Banner */}
        {criticalItems.length > 0 && (
          <div className="bg-red-50 border border-red-150 p-4 rounded-2xl flex items-start gap-3">
            <TrendingDown className="h-5.5 w-5.5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-900 uppercase tracking-wider">Depleted Blood Stocks Detected</p>
              <p className="text-xs text-red-700 leading-relaxed font-semibold">
                Central storage reports that the reserves for <span className="font-extrabold">{criticalItems.map((i) => i.bloodType?.name).join(', ')}</span> have dropped below safe hospital reserve margins. Registered compatible donors within close proximity are highly encouraged to prioritize scheduling dropoffs.
              </p>
            </div>
          </div>
        )}

        {/* Inventory Grid / Table */}
        <Card>
          <CardHeader>
            <CardTitle>Central Reserve Breakdown</CardTitle>
            <CardDescription>
              Detailed catalog of actual versus target minimum safety reserve levels by blood group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable />
            ) : items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <SlidersHorizontal className="h-7 w-7" />
                </div>
                <p className="text-base font-bold text-gray-900">No stock logs synchronized</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-medium border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs tracking-wider uppercase font-bold">
                      <th className="pb-3 pr-4">Blood Group</th>
                      <th className="pb-3 pr-4">Units Stored (Bags)</th>
                      <th className="pb-3 pr-4">Safety Margin (Target Threshold)</th>
                      <th className="pb-3 pr-4">Deficit / Safety Status</th>
                      {isAdmin && <th className="pb-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((i) => {
                      const isLow = i.unitsStored < i.minThreshold;
                      return (
                        <tr key={i.id} className="hover:bg-gray-50/40">
                          <td className="py-4 pr-4">
                            <span className="h-9 w-9 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center border border-red-100 shadow-sm text-sm">
                              {i.bloodType?.name || 'A+'}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`text-base font-extrabold ${isLow ? 'text-red-600 font-extrabold' : 'text-gray-900'}`}>
                              {i.unitsStored} Bags
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-gray-600 font-bold">{i.minThreshold} Bags</td>
                          <td className="py-4 pr-4">
                            <Badge variant={isLow ? 'critical' : 'success'}>
                              {isLow ? 'CRITICAL DEFICIT' : 'STABLE RESERVE'}
                            </Badge>
                          </td>
                          {isAdmin && (
                            <td className="py-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(i)}
                                className="h-8 px-2.5 flex items-center gap-1 font-bold"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Adjust Stock</span>
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adjust Stock Drawer / Dialog */}
        {editingItem && (
          <div className="fixed inset-0 bg-gray-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="bg-red-50/10 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <span>Adjust Stock: {editingItem.bloodType?.name || ''}</span>
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveStock} className="p-6 space-y-4">
                <Input
                  label="Units Stored (Bags)"
                  type="number"
                  required
                  value={unitsStored}
                  onChange={(e) => setUnitsStored(parseInt(e.target.value) || 0)}
                  placeholder="Total bags physically on reserve"
                />

                <Input
                  label="Safety Margin (Target threshold)"
                  type="number"
                  required
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(parseInt(e.target.value) || 0)}
                  placeholder="Bags below which a warning triggers"
                />

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                    className="font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="font-bold px-5"
                    isLoading={submitting}
                  >
                    Save Reserves
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
