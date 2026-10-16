import { Booking } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapBookingFromDb } from './mappers';

export const bookingService = {
  /**
   * Automatic Instant Booking:
   * Uses atomic PostgreSQL RPC with row-level locking to prevent overbooking and race conditions.
   */
  createBooking: async (params: {
    rideId: string;
    passengerId: string;
    seatsRequested: number;
    message?: string;
  }): Promise<Booking> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { rideId, passengerId, seatsRequested, message } = params;

    // 1. Attempt atomic RPC call first
    const { data: rpcData, error: rpcError } = await supabase.rpc('book_ride', {
      p_ride_id: rideId,
      p_seats_requested: seatsRequested,
      p_message: message || null,
    });

    if (!rpcError && rpcData?.booking_id) {
      // Fetch full booking with ride and passenger relations
      const { data: newBooking, error: fetchErr } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(*, creator:profiles!creator_id(*)),
          passenger:profiles!passenger_id(*)
        `)
        .eq('id', rpcData.booking_id)
        .single();

      if (!fetchErr && newBooking) {
        return mapBookingFromDb(newBooking);
      }
    }

    // If RPC failed due to validation or error, check if it's a domain rejection
    if (rpcError && rpcError.code !== 'PGRST202') {
      throw new Error(rpcError.message);
    }

    // 2. Direct transactional fallback if RPC function not yet created in SQL
    // Verify ride availability
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .single();

    if (rideError || !ride) {
      throw new Error('This ride is no longer available.');
    }

    if (ride.status === 'cancelled') {
      throw new Error('This ride has been cancelled by its creator.');
    }
    if (ride.status === 'completed') {
      throw new Error('This trip has already taken place.');
    }
    if (ride.creator_id === passengerId) {
      throw new Error('You cannot book a seat on a ride you created.');
    }
    if (seatsRequested > ride.seats_remaining) {
      throw new Error(`Only ${ride.seats_remaining} seat(s) available.`);
    }

    // Check existing booking
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('ride_id', rideId)
      .eq('passenger_id', passengerId)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (existingBooking) {
      throw new Error('You already have a confirmed seat on this ride.');
    }

    // Insert booking
    const totalContribution = (Number(ride.price_per_seat) || 0) * seatsRequested;
    const { data: createdBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        ride_id: rideId,
        passenger_id: passengerId,
        seats_booked: seatsRequested,
        total_contribution: totalContribution,
        status: 'confirmed',
        message: message?.trim() || null,
      })
      .select(`
        *,
        ride:rides(*, creator:profiles!creator_id(*)),
        passenger:profiles!passenger_id(*)
      `)
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Update remaining seats on ride
    const remaining = Math.max(0, ride.seats_remaining - seatsRequested);
    await supabase
      .from('rides')
      .update({
        seats_remaining: remaining,
        status: remaining === 0 ? 'full' : 'open',
      })
      .eq('id', rideId);

    return mapBookingFromDb(createdBooking);
  },

  /**
   * Fetch all bookings for a given passenger
   */
  getBookingsByPassenger: async (passengerId: string): Promise<Booking[]> => {
    if (!isSupabaseConfigured || !passengerId) return [];

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(*, creator:profiles!creator_id(*)),
          passenger:profiles!passenger_id(*)
        `)
        .eq('passenger_id', passengerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[bookingService.getBookingsByPassenger] Error:', error.message);
        throw new Error(error.message);
      }

      return (data || []).map(mapBookingFromDb);
    } catch (err: any) {
      console.error('[bookingService.getBookingsByPassenger] Exception:', err.message);
      throw err;
    }
  },

  /**
   * Fetch bookings for a specific ride (for creator view)
   */
  getBookingsForRide: async (rideId: string): Promise<Booking[]> => {
    if (!isSupabaseConfigured || !rideId) return [];

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          passenger:profiles!passenger_id(*)
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[bookingService.getBookingsForRide] Error:', error.message);
        throw new Error(error.message);
      }

      return (data || []).map(mapBookingFromDb);
    } catch (err: any) {
      console.error('[bookingService.getBookingsForRide] Exception:', err.message);
      throw err;
    }
  },

  /**
   * Cancel an existing confirmed booking and restore seats
   */
  cancelBooking: async (bookingId: string): Promise<void> => {
    if (!isSupabaseConfigured || !bookingId) return;

    // Try atomic RPC
    const { error: rpcError } = await supabase.rpc('cancel_booking', {
      p_booking_id: bookingId,
    });

    if (!rpcError) return;

    // Fallback: direct update
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*, ride:rides(*)')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) {
      throw new Error('Booking not found.');
    }

    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    // Restore seats
    if (booking.ride && booking.status === 'confirmed') {
      const restored = Math.min(
        booking.ride.total_capacity || 4,
        (booking.ride.seats_remaining || 0) + (booking.seats_booked || 1)
      );
      await supabase
        .from('rides')
        .update({
          seats_remaining: restored,
          status: 'open',
        })
        .eq('id', booking.ride_id);
    }
  },

  /**
   * Get all bookings (admin view)
   */
  getAllBookings: async (): Promise<Booking[]> => {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        ride:rides(*, creator:profiles!creator_id(*)),
        passenger:profiles!passenger_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[bookingService.getAllBookings] Error:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map(mapBookingFromDb);
  },
};
