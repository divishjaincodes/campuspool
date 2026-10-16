import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rideService, bookingService, reviewService } from '../services';
import { Ride, Booking } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatINR } from '../utils/costEngine';
import { formatRideDateTime } from '../utils/dateUtils';
import {
  Car,
  Calendar,
  Clock,
  Users,
  MapPin,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sparkles,
  Star,
} from 'lucide-react';

export const MyTripsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'created';

  const [cancelRideTarget, setCancelRideTarget] = useState<Ride | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);

  // Review modal state
  const [reviewBookingTarget, setReviewBookingTarget] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const [myCreatedRides, setMyCreatedRides] = useState<Ride[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [rideBookingsMap, setRideBookingsMap] = useState<Record<string, Booking[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMyTrips = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [rides, bookings] = await Promise.all([
        rideService.getRidesCreatedBy(currentUser.id),
        bookingService.getBookingsByPassenger(currentUser.id),
      ]);
      setMyCreatedRides(rides);
      setMyBookings(bookings);

      const bMap: Record<string, Booking[]> = {};
      await Promise.all(
        rides.map(async (r) => {
          bMap[r.id] = await bookingService.getBookingsForRide(r.id);
        })
      );
      setRideBookingsMap(bMap);
    } catch (err) {
      console.error('Failed fetching user trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrips();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleConfirmCancelRide = async () => {
    if (!cancelRideTarget) return;
    try {
      await rideService.cancelRide(cancelRideTarget.id, 'Cancelled by student creator.');
      showToast('Ride cancelled. Booked seats released and passengers notified.', 'info');
      setCancelRideTarget(null);
      await fetchMyTrips();
    } catch {
      showToast('Failed to cancel ride', 'error');
    }
  };

  const handleConfirmCancelBooking = async () => {
    if (!cancelBookingTarget || !currentUser) return;
    try {
      await bookingService.cancelBooking(cancelBookingTarget.id);
      showToast('Your booking was cancelled and the seat released.', 'info');
      setCancelBookingTarget(null);
      await fetchMyTrips();
    } catch {
      showToast('Failed to cancel booking', 'error');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingTarget || !currentUser) return;
    try {
      await reviewService.addReview({
        rideId: reviewBookingTarget.rideId,
        reviewerId: currentUser.id,
        reviewedUserId: reviewBookingTarget.ride?.creatorId || '',
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast('Thank you for rating your travel experience!', 'success');
      setReviewBookingTarget(null);
      setReviewComment('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
            My Trips & Carpools
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Manage journeys you created and seats you booked.
          </p>
        </div>

        <Link
          to="/create-ride"
          className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Offer a Ride
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D2D2D7]/70 text-xs font-semibold gap-6">
        <button
          onClick={() => handleTabChange('created')}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === 'created'
              ? 'text-[#0071E3]'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <span>Rides I Created ({myCreatedRides.length})</span>
          {activeTab === 'created' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3] rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('booked')}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === 'booked'
              ? 'text-[#0071E3]'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <span>Rides I Booked ({myBookings.length})</span>
          {activeTab === 'booked' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071E3] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1 Content: Rides I Created */}
      {activeTab === 'created' && (
        <div className="space-y-4">
          {myCreatedRides.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-8 text-center text-xs text-[#6E6E73]">
              <Car className="w-8 h-8 text-[#A1A1A6] mx-auto mb-2" />
              <p className="font-semibold text-sm text-[#1D1D1F]">No rides created yet</p>
              <p className="mt-1">
                Have a car or vehicle? Offer spare seats to fellow students and split trip costs.
              </p>
              <Link
                to="/create-ride"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold"
              >
                Offer a Ride Now
              </Link>
            </div>
          ) : (
            myCreatedRides.map((ride) => {
              const confirmedPassengers = (rideBookingsMap[ride.id] || []).filter(
                (b: Booking) => b.status === 'confirmed'
              );

              return (
                <div
                  key={ride.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5F5F7] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1D1D1F]">
                        {formatRideDateTime(ride.departureDate, ride.departureTime)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#6E6E73] capitalize">
                        {ride.pricingType} pricing
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          ride.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ride.status === 'full'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : ride.status === 'cancelled'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-gray-100 text-[#6E6E73]'
                        }`}
                      >
                        Status: {ride.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-sm text-[#1D1D1F]">
                        {ride.origin} → {ride.destination}
                      </p>
                      <p className="text-[#6E6E73] mt-0.5">
                        {ride.seatsRemaining} of {ride.seatsOffered} seats remaining • {formatINR(ride.pricePerSeat)} / seat
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/rides/${ride.id}`}
                        className="px-3 py-1.5 rounded-xl border border-[#D2D2D7] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7]"
                      >
                        View Details
                      </Link>
                      {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                        <button
                          onClick={() => setCancelRideTarget(ride)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition"
                        >
                          Cancel Ride
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirmed Passengers List */}
                  <div className="pt-3 border-t border-[#F5F5F7]">
                    <span className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider block mb-2">
                      Confirmed Passengers ({confirmedPassengers.length})
                    </span>

                    {confirmedPassengers.length === 0 ? (
                      <p className="text-xs text-[#A1A1A6] italic">
                        No students have booked seats yet. Seats remain open for instant booking.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {confirmedPassengers.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F5F7] text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  b.passenger?.avatarUrl ||
                                  'https://images.unsplash.com/photo-1534528741775?w=150'
                                }
                                alt={b.passenger?.fullName}
                                className="w-7 h-7 rounded-full object-cover border border-[#D2D2D7]"
                              />
                              <div>
                                <span className="font-semibold text-[#1D1D1F]">
                                  {b.passenger?.fullName}
                                </span>
                                <span className="text-[#6E6E73] ml-1.5">
                                  ({b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''})
                                </span>
                                {b.message && (
                                  <p className="text-[11px] text-[#6E6E73] italic">"{b.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0071E3]">
                                {formatINR(b.totalContribution)}
                              </span>
                              <Link
                                to="/messages"
                                className="p-1 rounded-lg hover:bg-white text-[#0071E3]"
                                title="Chat with student"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2 Content: Rides I Booked */}
      {activeTab === 'booked' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-8 text-center text-xs text-[#6E6E73]">
              <Users className="w-8 h-8 text-[#A1A1A6] mx-auto mb-2" />
              <p className="font-semibold text-sm text-[#1D1D1F]">No booked rides yet</p>
              <p className="mt-1">Find fellow students travelling your way and book a seat instantly.</p>
              <Link
                to="/rides"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold"
              >
                Find a Ride Now
              </Link>
            </div>
          ) : (
            myBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F5F5F7]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1D1D1F]">
                      {b.ride ? formatRideDateTime(b.ride.departureDate, b.ride.departureTime) : 'Journey Date'}
                    </span>
                    <span className="text-[#6E6E73]">• {b.seatsBooked} Seat(s) Booked</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'cancelled'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    Booking {b.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-[#1D1D1F]">
                      {b.ride?.origin} → {b.ride?.destination}
                    </p>
                    <p className="text-[#6E6E73] mt-0.5">
                      Ride Creator: <strong>{b.ride?.creator?.fullName || 'VIT Student'}</strong> • {b.ride?.vehicleModel}
                    </p>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      Agreed Contribution: <strong className="text-[#0071E3]">{formatINR(b.totalContribution)}</strong> (Directly payable via UPI during commute)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/messages"
                      className="px-3 py-1.5 rounded-xl border border-[#D2D2D7] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#0071E3]" /> Chat
                    </Link>

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => setCancelBookingTarget(b)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {b.status === 'completed' && (
                      <button
                        onClick={() => setReviewBookingTarget(b)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" /> Rate Ride
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cancel Ride Modal */}
      <ConfirmModal
        isOpen={!!cancelRideTarget}
        title="Cancel This Ride?"
        message="Cancelling this ride will notify any confirmed passengers and release all seats."
        confirmText="Yes, Cancel Ride"
        isDestructive={true}
        onConfirm={handleConfirmCancelRide}
        onCancel={() => setCancelRideTarget(null)}
      />

      {/* Cancel Booking Modal */}
      <ConfirmModal
        isOpen={!!cancelBookingTarget}
        title="Cancel Your Booking?"
        message="Cancelling this booking will immediately return your seat back to the ride for other students."
        confirmText="Yes, Cancel Seat"
        isDestructive={true}
        onConfirm={handleConfirmCancelBooking}
        onCancel={() => setCancelBookingTarget(null)}
      />

      {/* Rating & Review Modal */}
      {reviewBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#D2D2D7] shadow-xl text-xs">
            <h3 className="font-bold text-base text-[#1D1D1F] mb-1">Rate Your Trip</h3>
            <p className="text-[#6E6E73] mb-4">
              How was your commute with {reviewBookingTarget.ride?.creator?.fullName}?
            </p>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Punctual, friendly, clean car..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBookingTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[#D2D2D7] text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
