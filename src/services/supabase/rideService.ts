import { Ride } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapRideFromDb } from './mappers';

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
  /**
   * Fetch all open rides with optional search filters directly from Supabase
   */
  getAllRides: async (filters?: RideFilters): Promise<Ride[]> => {
    if (!isSupabaseConfigured) {
      console.warn('[rideService] Supabase not configured.');
      return [];
    }

    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          creator:profiles!creator_id(*)
        `)
        .neq('status', 'cancelled');

      // Filter by origin
      if (filters?.origin && filters.origin.trim()) {
        query = query.ilike('origin', `%${filters.origin.trim()}%`);
      }

      // Filter by destination
      if (filters?.destination && filters.destination.trim()) {
        query = query.ilike('destination', `%${filters.destination.trim()}%`);
      }

      // Filter by date
      if (filters?.date) {
        query = query.eq('departure_date', filters.date);
      }

      // Filter by min seats
      if (filters?.minSeats && filters.minSeats > 0) {
        query = query.gte('seats_remaining', filters.minSeats);
      }

      // Filter by max price
      if (filters?.maxPrice && filters.maxPrice > 0) {
        query = query.lte('price_per_seat', filters.maxPrice);
      }

      // Filter by gender preference
      if (filters?.genderPreference && filters.genderPreference !== 'all') {
        query = query.eq('gender_preference', filters.genderPreference);
      }

      // Filter by vehicle type
      if (filters?.vehicleType && filters.vehicleType !== 'all') {
        query = query.ilike('vehicle_type', filters.vehicleType);
      }

      // Sorting
      if (filters?.sortBy === 'price_asc') {
        query = query.order('price_per_seat', { ascending: true });
      } else if (filters?.sortBy === 'price_desc') {
        query = query.order('price_per_seat', { ascending: false });
      } else if (filters?.sortBy === 'seats_desc') {
        query = query.order('seats_remaining', { ascending: false });
      } else {
        // Default: upcoming departures first
        query = query
          .order('departure_date', { ascending: true })
          .order('departure_time', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('[rideService.getAllRides] Database error:', error.message);
        throw new Error(error.message);
      }

      return (data || []).map(mapRideFromDb);
    } catch (err: any) {
      console.error('[rideService.getAllRides] Failed to load rides:', err.message);
      throw err;
    }
  },

  /**
   * Fetch single ride by ID with creator profile
   */
  getRideById: async (rideId: string): Promise<Ride | null> => {
    if (!isSupabaseConfigured || !rideId) return null;

    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          creator:profiles!creator_id(*)
        `)
        .eq('id', rideId)
        .maybeSingle();

      if (error) {
        console.error('[rideService.getRideById] Error:', error.message);
        throw new Error(error.message);
      }

      return data ? mapRideFromDb(data) : null;
    } catch (err: any) {
      console.error('[rideService.getRideById] Exception:', err.message);
      throw err;
    }
  },

  /**
   * Fetch rides created by a specific student
   */
  getRidesCreatedBy: async (userId: string): Promise<Ride[]> => {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          creator:profiles!creator_id(*)
        `)
        .eq('creator_id', userId)
        .order('departure_date', { ascending: false });

      if (error) {
        console.error('[rideService.getRidesCreatedBy] Error:', error.message);
        throw new Error(error.message);
      }

      return (data || []).map(mapRideFromDb);
    } catch (err: any) {
      console.error('[rideService.getRidesCreatedBy] Exception:', err.message);
      throw err;
    }
  },

  /**
   * Create and publish a new carpool ride to Supabase
   */
  createRide: async (
    rideInput: Omit<Ride, 'id' | 'status' | 'seatsRemaining' | 'createdAt'>
  ): Promise<Ride> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please check your credentials.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    if (!currentUserId) {
      throw new Error('You must be signed in to offer a ride.');
    }

    const payload = {
      creator_id: currentUserId,
      origin: rideInput.origin.trim(),
      destination: rideInput.destination.trim(),
      intermediate_stops: rideInput.intermediateStops || [],
      departure_date: rideInput.departureDate,
      departure_time: rideInput.departureTime,
      estimated_duration: rideInput.estimatedDuration,
      vehicle_type: rideInput.vehicleType,
      vehicle_model: rideInput.vehicleModel,
      total_capacity: rideInput.totalCapacity,
      seats_offered: rideInput.seatsOffered,
      seats_remaining: rideInput.seatsOffered,
      pricing_type: rideInput.pricingType,
      price_per_seat: rideInput.pricePerSeat,
      total_trip_cost: rideInput.totalTripCost,
      contributing_passengers_count: rideInput.contributingPassengersCount,
      gender_preference: rideInput.genderPreference,
      luggage_allowance: rideInput.luggageAllowance,
      ac_available: rideInput.acAvailable,
      smoking_allowed: rideInput.smokingAllowed,
      notes: rideInput.notes,
      status: 'open',
    };

    const { data, error } = await supabase
      .from('rides')
      .insert(payload)
      .select(`
        *,
        creator:profiles!creator_id(*)
      `)
      .single();

    if (error) {
      console.error('[rideService.createRide] Insert error:', error.message);
      throw new Error(error.message);
    }

    return mapRideFromDb(data);
  },

  /**
   * Cancel an existing ride
   */
  cancelRide: async (rideId: string, _reason?: string): Promise<void> => {
    if (!isSupabaseConfigured || !rideId) return;

    // Try calling atomic RPC if available
    const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_ride', {
      p_ride_id: rideId,
    });

    if (!rpcError) {
      return;
    }

    // Fallback to direct update protected by RLS
    const { error: updateError } = await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId);

    if (updateError) {
      console.error('[rideService.cancelRide] Error:', updateError.message);
      throw new Error(updateError.message);
    }
  },
};
