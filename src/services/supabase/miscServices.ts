import { Notification, Review, SafetyReport } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapProfileToUser } from './mappers';

export const notificationService = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      // Derive dynamic activity notifications from real bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(*, creator:profiles!creator_id(*))
        `)
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!bookings || bookings.length === 0) return [];

      return bookings.map((b) => ({
        id: `notif_${b.id}`,
        userId,
        type: 'booking_confirmed',
        title: 'Seat Confirmed',
        message: `Your seat on the ride to ${b.ride?.destination || 'Campus'} is confirmed.`,
        isRead: false,
        createdAt: b.created_at,
      }));
    } catch {
      return [];
    }
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    if (!isSupabaseConfigured || !userId) return 0;
    try {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('passenger_id', userId)
        .eq('status', 'confirmed');
      return count || 0;
    } catch {
      return 0;
    }
  },

  markAllAsRead: async (_userId: string): Promise<void> => {
    // No-op or clear unread
  },

  markAsRead: async (_id: string): Promise<void> => {
    // No-op or mark specific read
  },
};

export const reviewService = {
  getReviewsForUser: async (userId: string): Promise<Review[]> => {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(*)')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      return (data || []).map((r) => ({
        id: r.id,
        rideId: r.ride_id,
        reviewerId: r.reviewer_id,
        reviewerName: r.reviewer?.full_name,
        reviewedUserId: r.reviewee_id,
        rating: r.rating,
        comment: r.comment || '',
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  },

  createReview: async (reviewInput: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ride_id: reviewInput.rideId,
        reviewer_id: reviewInput.reviewerId,
        reviewee_id: reviewInput.reviewedUserId,
        rating: reviewInput.rating,
        comment: reviewInput.comment,
      })
      .select('*, reviewer:profiles!reviewer_id(*)')
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      rideId: data.ride_id,
      reviewerId: data.reviewer_id,
      reviewerName: data.reviewer?.full_name,
      reviewedUserId: data.reviewee_id,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.created_at,
    };
  },

  addReview: async (reviewInput: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    return reviewService.createReview(reviewInput);
  },
};

export const reportService = {
  createReport: async (reportInput: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>): Promise<SafetyReport> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reportInput.reporterId,
        reported_user_id: reportInput.reportedUserId,
        ride_id: reportInput.rideId || null,
        reason: reportInput.category,
        details: reportInput.description,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      reporterId: data.reporter_id,
      reportedUserId: data.reported_user_id,
      rideId: data.ride_id,
      category: data.reason as any,
      description: data.details,
      status: data.status,
      createdAt: data.created_at,
      resolutionNote: data.admin_notes,
    };
  },

  submitReport: async (reportInput: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>): Promise<SafetyReport> => {
    return reportService.createReport(reportInput);
  },

  getAllReports: async (): Promise<SafetyReport[]> => {
    if (!isSupabaseConfigured) return [];
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    return (data || []).map((r) => ({
      id: r.id,
      reporterId: r.reporter_id,
      reportedUserId: r.reported_user_id,
      rideId: r.ride_id,
      category: r.reason as any,
      description: r.details,
      status: r.status,
      createdAt: r.created_at,
      resolutionNote: r.admin_notes,
    }));
  },

  updateReportStatus: async (reportId: string, status: any, adminNotes?: string): Promise<void> => {
    const { error } = await supabase
      .from('reports')
      .update({ status, admin_notes: adminNotes })
      .eq('id', reportId);
    if (error) throw new Error(error.message);
  },
};

export interface AdminStats {
  totalUsers: number;
  activeRides: number;
  totalBookings: number;
  completedRides: number;
  openReports: number;
  popularRoutes: { route: string; count: number }[];
  ridesByStatus: { status: string; count: number }[];
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    if (!isSupabaseConfigured) {
      return {
        totalUsers: 0,
        activeRides: 0,
        totalBookings: 0,
        completedRides: 0,
        openReports: 0,
        popularRoutes: [],
        ridesByStatus: [],
      };
    }

    const [usersRes, ridesRes, bookingsRes, reportsRes, allRidesRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('rides').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('rides').select('origin, destination, status'),
    ]);

    const rides = allRidesRes.data || [];
    const completedRides = rides.filter((r) => r.status === 'completed').length;

    // Route popularity
    const routeCounts = new Map<string, number>();
    rides.forEach((r) => {
      const key = `${r.origin.split('(')[0].trim()} → ${r.destination.split('(')[0].trim()}`;
      routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
    });

    const popularRoutes = Array.from(routeCounts.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const statusMap = new Map<string, number>();
    rides.forEach((r) => {
      statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
    });
    const ridesByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    return {
      totalUsers: usersRes.count || 0,
      activeRides: ridesRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      completedRides,
      openReports: reportsRes.count || 0,
      popularRoutes,
      ridesByStatus,
    };
  },

  adminCancelRide: async (rideId: string, _reason?: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId);
    if (error) throw new Error(error.message);
  },

  toggleUserSuspension: async (userId: string) => {
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!user) throw new Error('User not found');

    const nextState = !user.is_suspended;
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ is_suspended: nextState })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapProfileToUser(updated);
  },
};
