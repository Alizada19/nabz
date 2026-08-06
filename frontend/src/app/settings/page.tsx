'use client';

import React, { useState } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/toast';
import {
  Settings,
  Bell,
  Sliders,
  User,
  Shield,
  Volume2,
  Lock,
  Globe,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [radius, setRadius] = useState('50');
  const [language, setLanguage] = useState('English');

  const handleSaveSettings = () => {
    success('Configuration preferences saved successfully!');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure system configurations, matching alert preferences, radii ranges, and security credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation Sidebar settings */}
          <div className="space-y-4">
            <Card className="shadow-md border-gray-100 rounded-2xl overflow-hidden">
              <div className="p-4 bg-gray-50/75 border-b border-gray-100">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">SETTINGS CONSOLE</span>
              </div>
              <CardContent className="p-2 space-y-1">
                <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600">
                  <Sliders className="h-4.5 w-4.5" />
                  <span>General Preferences</span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50">
                  <Bell className="h-4.5 w-4.5" />
                  <span>Notifications Config</span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50">
                  <Lock className="h-4.5 w-4.5" />
                  <span>Security & Auth</span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Central preferences pane */}
          <div className="lg:col-span-2 space-y-6">
            {/* Matching parameters */}
            <Card className="shadow-lg border-gray-100 rounded-3xl">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-red-500" />
                  <span>Radius Proximity & Search Controls</span>
                </CardTitle>
                <CardDescription>Configure emergency broadcast detection thresholds</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Default Matching Detection Radius (km)
                  </label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 bg-white"
                  >
                    <option value="10">10 km (Immediate Nearby Localities)</option>
                    <option value="25">25 km (Regional State)</option>
                    <option value="50">50 km (Metropolitan Radius)</option>
                    <option value="100">100 km (Wide-scale Region)</option>
                    <option value="250">250 km (Cross-border National)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    System Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-red-500 bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Malay">Bahasa Melayu</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Notification preferences */}
            <Card className="shadow-lg border-gray-100 rounded-3xl">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  <span>Real-time Alert Dispatches</span>
                </CardTitle>
                <CardDescription>Determine how matching updates are delivered</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Email Dispatches</p>
                    <p className="text-xs text-gray-400">Receive full email compatible donor dossiers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={() => setEmailAlerts(!emailAlerts)}
                    className="h-4.5 w-4.5 rounded text-red-600 border-gray-300 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">SMS Alerts</p>
                    <p className="text-xs text-gray-400">Receive instantaneous critical broadcast codes via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={() => setSmsAlerts(!smsAlerts)}
                    className="h-4.5 w-4.5 rounded text-red-600 border-gray-300 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                  <Button type="button" onClick={handleSaveSettings} className="px-5 font-bold bg-red-600 hover:bg-red-700">
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
