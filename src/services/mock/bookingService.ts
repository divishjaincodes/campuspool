import { Booking, Ride, User } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_BOOKINGS, INITIAL_RIDES } from '../../data/mockData';
import { authService } from './authService';
import { notificationService } from './notificationService';

export const bookingService = {
  getAllBookings: (): Booking[] => {
    initStorageIfEmpty();
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const users = authService.getAllUsers();

    const rideMap = new Map<string, Ride>(rides.map((r) => [r.id, r]));
    const userMap = new Map<string, User>(users.map((u) => [u.id, u]));

    return bookings.map((b) => {
      const ride = rideMap.get(b.rideId);
      if (ride) {
        ride.creator = userMap.get(ride.creatorId);
      }
      return {
        ...b,
        ride,
        passenger: userMap.get(b.passengerId),
      };
    });
  },

  getBookingsByPassenger: (passengerId: string): Booking[] => {
    return bookingService.getAllBookings().filter((b) => b.passengerId === passengerId);
  },

  getBookingsForRide: (rideId: string): Booking[] => {
    return bookingService.getAllBookings().filter((b) => b.rideId === rideId);
  },

  /**
   * Automatic Instant Booking:
   * Direct booking with instantaneous confirmation when seats are available and criteria met.
   */
  createBooking: async (params: {
    rideId: string;
    passengerId: string;
    seatsRequested: number;
    message?: string;
  }): Promise<Booking> => {
    initStorageIfEmpty();
    const { rideId, passengerId, seatsRequested, message } = params;

    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const rideIndex = rides.findIndex((r) => r.id === rideId);
    if (rideIndex === -1) {
      throw new Error('This ride is no longer available.');
    }

    const ride = rides[rideIndex];

    if (ride.status === 'cancelled') {
      throw new Error('This ride has been cancelled by its creator.');
    }
    if (ride.status === 'completed') {
      throw new Error('This trip has already taken place.');
    }

    // Check 1: Creator cannot book their own ride
    if (ride.creatorId === passengerId) {
      throw new Error('You cannot book a seat on a ride you created.');
    }

    // Check 2: Passenger cannot duplicate an active booking for the same ride
    const currentBookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const existingActiveBooking = currentBookings.find(
      (b) => b.rideId === rideId && b.passengerId === passengerId && b.status === 'confirmed'
    );
    if (existingActiveBooking) {
      throw new Error('You already have a confirmed seat on this ride.');
    }

    // Check 3: Check seat capacity and prevent overbooking
    if (seatsRequested > ride.seatsRemaining) {
      throw new Error(`Only ${ride.seatsRemaining} seat${ride.seatsRemaining === 1 ? '' : 's'} available.`);
    }

    // Check 4: Enforce gender restriction
    const users = authService.getAllUsers();
    const passenger = users.find((u) => u.id === passengerId);
    if (!passenger) {
      throw new Error('Passenger user profile not found.');
    }

    if (ride.genderPreference === 'women_only') {
      if (passenger.gender !== 'female') {
        throw new Error(
          'This ride is designated as Women-only. Booking is reserved for female students to ensure campus community guidelines are respected.'
        );
      }
    }

    // Deduct seats immediately
    const updatedSeatsRemaining = ride.seatsRemaining - seatsRequested;
    const isNowFull = updatedSeatsRemaining === 0;

    rides[rideIndex] = {
      ...ride,
      seatsRemaining: updatedSeatsRemaining,
      status: isNowFull ? 'full' : 'open',
    };
    setStorage(STORAGE_KEYS.RIDES, rides);

    const totalContribution = ride.pricePerSeat * seatsRequested;

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      rideId,
      passengerId,
      seatsBooked: seatsRequested,
      totalContribution,
      status: 'confirmed', // Automatically Confirmed!
      message: message?.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [newBooking, ...currentBookings];
    setStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Instant Notifications
    // 1. Notify Ride Creator
    await notificationService.createNotification({
      userId: ride.creatorId,
      title: 'New Instant Booking',
      message: `${passenger.fullName} booked ${seatsRequested} seat${seatsRequested > 1 ? 's' : ''} on your ride (${ride.origin} → ${ride.destination}).`,
      type: 'booking_confirmed',
      link: '/my-trips',
    });

    // 2. Notify Passenger
    await notificationService.createNotification({
      userId: passengerId,
      title: 'Booking Confirmed!',
      message: `Your booking for ${seatsRequested} seat${seatsRequested > 1 ? 's' : ''} on the ride to ${ride.destination} is confirmed.`,
      type: 'booking_confirmed',
      link: '/my-trips',
    });

    return newBooking;
  },

  /**
   * Cancel booking and release seats back to the ride
   */
  cancelBooking: async (bookingId: string, currentUserId: string): Promise<Booking> => {
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }

    const booking = bookings[bookingIndex];

    const rides = getStorage<Ride[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const rideIndex = rides.findIndex((r) => r.id === booking.rideId);
    const ride = rideIndex !== -1 ? rides[rideIndex] : null;

    // Allow cancellation if current user is either the passenger or the ride creator
    if (booking.passengerId !== currentUserId && ride?.creatorId !== currentUserId) {
      throw new Error('You do not have permission to cancel this booking.');
    }

    if (booking.status === 'cancelled') {
      return booking;
    }

    const updatedBooking: Booking = {
      ...booking,
      status: 'cancelled',
    };
    bookings[bookingIndex] = updatedBooking;
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // Release seats back if ride exists and not already cancelled
    if (ride && ride.status !== 'cancelled') {
      const newRemaining = ride.seatsRemaining + booking.seatsBooked;
      rides[rideIndex] = {
        ...ride,
        seatsRemaining: Math.min(ride.seatsOffered, newRemaining),
        status: ride.status === 'full' ? 'open' : ride.status,
      };
      setStorage(STORAGE_KEYS.RIDES, rides);
    }

    // Send notifications
    const users = authService.getAllUsers();
    const canceller = users.find((u) => u.id === currentUserId);
    const cancellerName = canceller?.fullName || 'A student';

    if (ride) {
      // If passenger cancelled, notify ride creator
      if (currentUserId === booking.passengerId) {
        await notificationService.createNotification({
          userId: ride.creatorId,
          title: 'Booking Cancelled',
          message: `${cancellerName} cancelled their ${booking.seatsBooked} seat booking for ${ride.destination}. The seat is now open.`,
          type: 'booking_cancelled',
          link: '/my-trips',
        });
      } else {
        // If creator cancelled, notify passenger
        await notificationService.createNotification({
          userId: booking.passengerId,
          title: 'Booking Cancelled by Ride Creator',
          message: `Your booking for ${ride.destination} was cancelled by the ride creator.`,
          type: 'booking_cancelled',
          link: '/my-trips',
        });
      }
    }

    return updatedBooking;
  },
};
