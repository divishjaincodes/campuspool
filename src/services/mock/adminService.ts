import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { User, Ride, Booking, SafetyReport } from '../../types';
import { INITIAL_USERS, INITIAL_RIDES, INITIAL_BOOKINGS, INITIAL_REPORTS } from '../../data/mockData';

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
  getStats: (): AdminStats => {
    initStorageIfEmpty();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const reports = getStorage<SafetyReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);

    const activeRides = rides.filter((r) => r.status === 'open' || r.status === 'full').length;
    const completedRides = rides.filter((r) => r.status === 'completed').length;
    const openReports = reports.filter((rep) => rep.status === 'pending' || rep.status === 'investigating').length;

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
      totalUsers: users.length,
      activeRides,
      totalBookings: bookings.length,
      completedRides,
      openReports,
      popularRoutes,
      ridesByStatus,
    };
  },

  toggleUserSuspension: async (userId: string): Promise<User> => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');

    const user = users[index];
    const updated: User = {
      ...user,
      isSuspended: !user.isSuspended,
    };
    users[index] = updated;
    setStorage(STORAGE_KEYS.USERS, users);
    return updated;
  },

  adminCancelRide: async (rideId: string, reason?: string): Promise<Ride> => {
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const index = rides.findIndex((r) => r.id === rideId);
    if (index === -1) throw new Error('Ride not found');

    const updated: Ride = {
      ...rides[index],
      status: 'cancelled',
      notes: reason ? `[Moderator Action] ${reason}` : rides[index].notes,
    };
    rides[index] = updated;
    setStorage(STORAGE_KEYS.RIDES, rides);
    return updated;
  },
};
