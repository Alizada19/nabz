'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isAuthenticated, loading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initialize();

    const handleLogoutEvent = () => {
      logout();
      router.push('/login');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('nabz_logout', handleLogoutEvent);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('nabz_logout', handleLogoutEvent);
      }
    };
  }, [initialize, logout, router]);

  // Handle protected and guest-only routes
  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (isAuthenticated && isPublicPath && pathname !== '/') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Loading Nabz Blood Donation Platform...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
