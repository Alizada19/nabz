'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileHeart,
  Search,
  Bell,
  User,
  Heart,
  LogOut,
  Menu,
  X,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { notificationsService } from '@/api/notifications';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await notificationsService.findMine({ limit: 100 });
        if (res.success && res.data) {
          const unread = res.data.items.filter((n) => !n.readAt).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Define navigation groups and items based on role
  const isDonor = user?.role === 'donor';
  const isSeeker = user?.role === 'seeker';
  const isAdmin = user?.role === 'admin';

  const menuGroups = [
    {
      title: 'Main Console',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          show: true,
        },
        {
          name: 'Notifications',
          href: '/notifications',
          icon: Bell,
          show: true,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
    {
      title: 'Services & Matching',
      items: [
        {
          name: 'Blood Requests',
          href: '/blood-requests',
          icon: FileHeart,
          show: true,
        },
        {
          name: 'Find Donors',
          href: '/donors/search',
          icon: Search,
          show: isSeeker || isAdmin || isDonor,
        },
      ],
    },
    {
      title: 'Personal Info',
      items: [
        {
          name: 'Donor Profile',
          href: '/donor-profile',
          icon: Heart,
          show: isDonor,
        },
        {
          name: 'My Profile',
          href: '/profile',
          icon: User,
          show: true,
        },
      ],
    },
  ];

  const renderNavGroup = (group: typeof menuGroups[0], onClickItem?: () => void) => {
    const visibleItems = group.items.filter((item) => item.show);
    if (visibleItems.length === 0) return null;

    return (
      <div key={group.title} className="space-y-2 pt-4 first:pt-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
          {group.title}
        </p>
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  if (onClickItem) onClickItem();
                }}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  active
                    ? 'bg-red-50 text-red-600 shadow-sm border-l-4 border-red-500 rounded-l-none'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold h-4.5 min-w-4.5 px-1.5 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="h-3 w-3 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50/50 text-gray-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-100 h-full shrink-0">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-50 shrink-0">
          <Activity className="h-6 w-6 text-red-600 animate-pulse" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
            Nabz Platform
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => renderNavGroup(group))}
        </nav>

        {/* User profile bottom card */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/40 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 font-extrabold flex items-center justify-center border border-red-200 shadow-sm text-sm shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-gray-500 truncate uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay & drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative flex flex-col w-64 max-w-xs bg-white h-full border-r border-gray-100 z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-red-600 animate-pulse" />
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                  Nabz Platform
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              {menuGroups.map((group) => renderNavGroup(group, () => setMobileOpen(false)))}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/40 shrink-0">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 font-extrabold flex items-center justify-center border border-red-200 text-sm shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 truncate uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-50"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {user?.role} Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick availability stats indicator */}
            {isDonor && (
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  user?.isAvailable
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${user?.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {user?.isAvailable ? 'Available to Donate' : 'Unavailable'}
              </span>
            )}

            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            <div className="h-8 w-px bg-gray-100" />

            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 border border-red-100 font-extrabold flex items-center justify-center text-xs">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-gray-700">{user?.name}</span>
            </button>
          </div>
        </header>

        {/* Page Content area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
