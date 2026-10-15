import { Ride, User } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_RIDES } from '../../data/mockData';
import { authService } from './authService';

export interface RideFilters {
  origin?: string;
  destination?: string;
  date?: string;
  minSeats?: number;
  maxPrice?: number;
  genderPreference?: 'all' | 'everyone' | 'women_only';
  vehicleType?: string;
  sortBy?: 'time_asc' | 'price_asc' | 'price_desc' | 'seats_desc';
}

export const rideService = {
  getAllRides: (filters?: RideFilters): Ride[] => {
    initStorageIfEmpty();
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const users = authService.getAllUsers();
    const userMap = new Map<string, User>(users.map((u) => [u.id, u]));

    // Populate creator
    let populated = rides.map((r) => ({
      ...r,
      creator: userMap.get(r.creatorId),
    }));

    if (!filters) return populated;

    if (filters.origin && filters.origin.trim() !== '') {
      const q = filters.origin.toLowerCase().trim();
      populated = populated.filter(
        (r) =>
          r.origin.toLowerCase().includes(q) ||
          r.intermediateStops?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.destination && filters.destination.trim() !== '') {
      const q = filters.destination.toLowerCase().trim();
      populated = populated.filter((r) => r.destination.toLowerCase().includes(q));
    }

    if (filters.date) {
      populated = populated.filter((r) => r.departureDate === filters.date);
    }

    if (filters.minSeats && filters.minSeats > 0) {
      populated = populated.filter((r) => r.seatsRemaining >= filters.minSeats!);
    }

    if (filters.maxPrice && filters.maxPrice > 0) {
      populated = populated.filter((r) => r.pricePerSeat <= filters.maxPrice!);
    }

    if (filters.genderPreference && filters.genderPreference !== 'all') {
      populated = populated.filter((r) => r.genderPreference === filters.genderPreference);
    }

    if (filters.vehicleType && filters.vehicleType !== 'all') {
      populated = populated.filter(
        (r) => r.vehicleType.toLowerCase() === filters.vehicleType!.toLowerCase()
      );
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'time_asc') {
        populated.sort((a, b) => `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`));
      } else if (filters.sortBy === 'price_asc') {
        populated.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
      } else if (filters.sortBy === 'price_desc') {
        populated.sort((a, b) => b.pricePerSeat - a.pricePerSeat);
      } else if (filters.sortBy === 'seats_desc') {
        populated.sort((a, b) => b.seatsRemaining - a.seatsRemaining);
      }
    } else {
      // Default sort by departure date/time
      populated.sort((a, b) => `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`));
    }

    return populated;
  },

  getRideById: (rideId: string): Ride | undefined => {
    const rides = rideService.getAllRides();
    return rides.find((r) => r.id === rideId);
  },

  getRidesCreatedBy: (userId: string): Ride[] => {
    const rides = rideService.getAllRides();
    return rides.filter((r) => r.creatorId === userId);
  },

  createRide: async (rideInput: Omit<Ride, 'id' | 'status' | 'seatsRemaining' | 'createdAt'>): Promise<Ride> => {
    initStorageIfEmpty();
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);

    const newRide: Ride = {
      ...rideInput,
      id: `ride_${Date.now()}`,
      status: 'open',
      seatsRemaining: rideInput.seatsOffered,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRide, ...rides];
    setStorage(STORAGE_KEYS.RIDES, updated);
    return newRide;
  },

  cancelRide: async (rideId: string, _reason?: string): Promise<Ride> => {
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const index = rides.findIndex((r) => r.id === rideId);
    if (index === -1) throw new Error('Ride not found');

    const updatedRide: Ride = { ...rides[index], status: 'cancelled' };
    rides[index] = updatedRide;
    setStorage(STORAGE_KEYS.RIDES, rides);

    // Cancel all active bookings for this ride
    const bookings = getStorage<any[]>(STORAGE_KEYS.BOOKINGS, []);
    const updatedBookings = bookings.map((b) => {
      if (b.rideId === rideId && b.status === 'confirmed') {
        return { ...b, status: 'cancelled' };
      }
      return b;
    });
    setStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);

    return updatedRide;
  },

  updateRideStatus: async (rideId: string, status: Ride['status']): Promise<Ride> => {
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const index = rides.findIndex((r) => r.id === rideId);
    if (index === -1) throw new Error('Ride not found');

    const updated = { ...rides[index], status };
    rides[index] = updated;
    setStorage(STORAGE_KEYS.RIDES, rides);
    return updated;
  },
};
