import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services';
import { Notification } from '../types';
import { getRelativeTimestamp } from '../utils/dateUtils';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    if (currentUser) {
      setNotifications(notificationService.getUserNotifications(currentUser.id));
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.id);
    loadNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#D2D2D7]/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">Stay updated on your rides and bookings</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-8 text-center text-xs text-[#6E6E73]">
          <Bell className="w-8 h-8 text-[#A1A1A6] mx-auto mb-2" />
          <p className="font-semibold text-sm text-[#1D1D1F]">No notifications</p>
          <p className="mt-1">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const isBooking = n.type === 'booking_confirmed';
            const isCancel = n.type === 'booking_cancelled' || n.type === 'ride_cancelled';
            const isMessage = n.type === 'new_message';

            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 text-xs ${
                  n.isRead
                    ? 'bg-[#FFFFFF] border-[#D2D2D7]/60'
                    : 'bg-[#0071E3]/5 border-[#0071E3]/30 shadow-sm'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isBooking
                      ? 'bg-emerald-50 text-emerald-600'
                      : isCancel
                      ? 'bg-red-50 text-red-600'
                      : isMessage
                      ? 'bg-blue-50 text-[#0071E3]'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {isBooking && <CheckCircle2 className="w-5 h-5" />}
                  {isCancel && <XCircle className="w-5 h-5" />}
                  {isMessage && <MessageSquare className="w-5 h-5" />}
                  {!isBooking && !isCancel && !isMessage && <Bell className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1D1D1F] truncate">{n.title}</h3>
                    <span className="text-[10px] text-[#A1A1A6] shrink-0 ml-2">
                      {getRelativeTimestamp(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#6E6E73] mt-1 leading-relaxed">{n.message}</p>

                  {n.link && (
                    <Link
                      to={n.link}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071E3] hover:underline mt-2"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[#0071E3] shrink-0 self-center" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
