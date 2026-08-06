'use client';

import React, { useState } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Globe,
  PlusCircle,
  Building,
} from 'lucide-react';

const mockBloodBanks = [
  {
    id: '1',
    name: 'Kuala Lumpur Central Blood Bank',
    address: 'Jalan Pahang, 53000 Kuala Lumpur',
    phone: '+603-2615 5555',
    email: 'kl.central@bloodbank.org.my',
    hours: '24 Hours Open',
    stockStatus: 'High Reserves',
    lat: 3.1725,
    lng: 101.7017,
  },
  {
    id: '2',
    name: 'Selangor State Blood Repository',
    address: 'Persiaran Masjid, Seksyen 14, 40000 Shah Alam, Selangor',
    phone: '+603-5512 6200',
    email: 'selangor.rep@bloodbank.org.my',
    hours: '8:00 AM - 10:00 PM',
    stockStatus: 'Critical A- / O+',
    lat: 3.0738,
    lng: 101.5183,
  },
  {
    id: '3',
    name: 'Borneo Red Cross Blood Center',
    address: 'Jalan Tun Abang Haji Openg, 93000 Kuching, Sarawak',
    phone: '+6082-242 566',
    email: 'borneo.rc@redcross.org.my',
    hours: '8:00 AM - 6:00 PM',
    stockStatus: 'Medium Reserves',
    lat: 1.5492,
    lng: 110.3444,
  },
  {
    id: '4',
    name: 'Penang Island General Blood Bank',
    address: 'Jalan Residen, 10450 George Town, Pulau Pinang',
    phone: '+604-222 5333',
    email: 'penang.ibb@gov.my',
    hours: '24 Hours Open',
    stockStatus: 'High Reserves',
    lat: 5.4164,
    lng: 100.3121,
  },
];

export default function BloodBanksDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = mockBloodBanks.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Blood Banks Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse participating Blood Bank organizations. Check operating hours, stock statuses, and contact information.
          </p>
        </div>

        {/* Search bar */}
        <Card className="shadow-md border-gray-100 rounded-2xl">
          <CardContent className="p-4 flex items-center relative">
            <span className="absolute left-7.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search blood banks by name or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 transition-all"
            />
          </CardContent>
        </Card>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanks.map((b) => (
            <Card key={b.id} className="shadow-lg border-gray-100 rounded-3xl hover:shadow-xl transition-shadow overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50/30 border-b border-gray-100/50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-gray-900 leading-snug">{b.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] bg-red-100/70 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200/50 uppercase tracking-wider">
                      <Heart className="h-3 w-3 shrink-0" /> {b.stockStatus}
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center shrink-0">
                    <Building className="h-5 w-5 text-red-500" />
                  </div>
                </div>

                <div className="p-6 space-y-3.5 text-xs text-gray-600">
                  <p className="flex items-start gap-2.5 leading-relaxed font-semibold">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>

                  <p className="flex items-center gap-2.5 font-bold">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{b.phone}</span>
                  </p>

                  <p className="flex items-center gap-2.5 font-semibold">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-red-600 hover:underline">{b.email}</span>
                  </p>

                  <p className="flex items-center gap-2.5 font-semibold border-t border-gray-50 pt-3">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-900 font-bold">{b.hours}</span>
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">PROXIMITY COORDINATED</span>
                <Button variant="outline" size="sm" className="h-8 font-bold text-xs" onClick={() => window.open(`https://maps.google.com/?q=${b.lat},${b.lng}`, '_blank')}>
                  <Globe className="h-3.5 w-3.5 mr-1" /> View Map
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
