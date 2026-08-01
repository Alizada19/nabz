'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { notificationsService } from '@/api/notifications';
import { Notification } from '@/api/types';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonTable } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Clock, Mail, MailOpen } from 'lucide-react';

export default function NotificationsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsService.findMine({ page, limit: 10 });
      if (res.success && res.data) {
        setNotifications(res.data.items);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationsService.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        success('Marked as read!');
      }
    } catch (err) {
      console.error(err);
      error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.readAt);
    if (unread.length === 0) return;

    try {
      setLoading(true);
      // Mark each unread notification as read
      await Promise.all(unread.map((n) => notificationsService.markAsRead(n.id)));
      success('All notifications marked as read!');
      fetchNotifications();
    } catch (err) {
      console.error(err);
      error('Failed to mark all as read');
      setLoading(false);
    }
  };

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Stay updated with system matched compatible requests, alerts and actions.
            </p>
          </div>

          {hasUnread && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 font-bold shrink-0"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All as Read</span>
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <SkeletonTable />
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <Bell className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900">No notifications yet</p>
                  <p className="text-xs text-gray-400">We will notify you here when new matches or updates occur.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((n) => {
                      const isRead = !!n.readAt;
                      return (
                        <li
                          key={n.id}
                          className={`py-4 transition-colors rounded-xl px-4 -mx-4 ${
                            isRead ? 'opacity-70 hover:bg-gray-50/30' : 'bg-red-50/10 hover:bg-red-50/20'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 pt-0.5">
                              {isRead ? (
                                <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border border-gray-200">
                                  <MailOpen className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
                                  <Mail className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <p className={`text-sm font-bold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                  {n.title}
                                </p>
                                <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold shrink-0">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                {n.message}
                              </p>
                            </div>

                            {!isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-xs font-bold text-red-600 hover:bg-red-50 h-8 px-2.5"
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-400">
                    Showing Page <span className="text-gray-700">{meta.page}</span> of{' '}
                    <span className="text-gray-700">{meta.totalPages}</span> ({meta.total} notifications total)
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
    </SidebarLayout>
  );
}
