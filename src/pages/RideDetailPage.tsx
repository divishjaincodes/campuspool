import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rideService, reviewService, reportService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GenderBadge } from '../components/rides/GenderBadge';
import { InstantBookModal } from '../components/rides/InstantBookModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatINR } from '../utils/costEngine';
import { formatRideDateTime } from '../utils/dateUtils';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Users,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const RideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<any>('inappropriate_behaviour');
  const [reportDescription, setReportDescription] = useState('');

  const ride = rideService.getRideById(id || '');

  if (!ride) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#1D1D1F]">Ride Not Found</h2>
        <p className="text-xs text-[#6E6E73] mt-2">
          This ride may have been removed or does not exist.
        </p>
        <Link
          to="/rides"
          className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold"
        >
          Browse All Rides
        </Link>
      </div>
    );
  }

  const isCreator = currentUser?.id === ride.creatorId;
  const isFull = ride.status === 'full' || ride.seatsRemaining === 0;
  const isCancelled = ride.status === 'cancelled';
  const reviews = reviewService.getReviewsForUser(ride.creatorId);

  const handleCancelRide = async () => {
    try {
      await rideService.cancelRide(ride.id, 'Cancelled by ride creator.');
      showToast('Ride has been cancelled. Affected students have been notified.', 'info');
      setShowCancelModal(false);
      navigate('/my-trips');
    } catch {
      showToast('Failed to cancel ride', 'error');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await reportService.submitReport({
        reporterId: currentUser.id,
        reportedUserId: ride.creatorId,
        rideId: ride.id,
        category: reportCategory,
        description: reportDescription,
      });
      showToast('Safety report submitted to campus moderators.', 'success');
      setShowReportModal(false);
      setReportDescription('');
    } catch {
      showToast('Failed to submit report', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search
      </button>

      {/* Main Journey Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-8 shadow-sm">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F5F5F7]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-[#F5F5F7] px-3 py-1 rounded-full text-[#1D1D1F] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
              {formatRideDateTime(ride.departureDate, ride.departureTime)}
            </span>
            <GenderBadge preference={ride.genderPreference} />
          </div>

          <div className="flex items-center gap-2">
            {isFull && (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Ride Full
              </span>
            )}
            {isCancelled && (
              <span className="text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full">
                Cancelled
              </span>
            )}
          </div>
        </div>

        {/* Route Details with Timeline */}
        <div className="py-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-4 h-4 rounded-full border-2 border-[#0071E3] bg-white" />
              <div className="w-0.5 h-12 bg-[#D2D2D7]/80 my-1" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6E6E73]">Starting Location</p>
              <h2 className="text-lg font-bold text-[#1D1D1F]">{ride.origin}</h2>
              <p className="text-xs text-[#6E6E73]">Departure: {ride.departureTime}</p>
            </div>
          </div>

          {ride.intermediateStops && ride.intermediateStops.length > 0 && (
            <div className="flex items-start gap-4 -mt-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A1A1A6]" />
                <div className="w-0.5 h-8 bg-[#D2D2D7]/80 my-1" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6E6E73]">Intermediate Stops</p>
                <p className="text-xs text-[#1D1D1F]">{ride.intermediateStops.join(' • ')}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4 -mt-2">
            <div className="w-4 h-4 rounded-full bg-[#0071E3] mt-1 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#6E6E73]">Destination</p>
              <h2 className="text-lg font-bold text-[#1D1D1F]">{ride.destination}</h2>
              {ride.estimatedDuration && (
                <p className="text-xs text-[#6E6E73]">Estimated duration: {ride.estimatedDuration}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes from Ride Creator */}
        {ride.notes && (
          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/50 text-xs">
            <p className="font-semibold text-[#1D1D1F] mb-1">Notes from Ride Creator:</p>
            <p className="text-[#6E6E73] leading-relaxed">{ride.notes}</p>
          </div>
        )}

        {/* Ride Amenities */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-[#D2D2D7]/60 bg-white">
            <span className="text-[#6E6E73] block text-[11px]">Vehicle</span>
            <span className="font-semibold text-[#1D1D1F]">
              {ride.vehicleModel || ride.vehicleType}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-[#D2D2D7]/60 bg-white">
            <span className="text-[#6E6E73] block text-[11px]">Seats Available</span>
            <span className="font-semibold text-[#0071E3]">
              {ride.seatsRemaining} of {ride.seatsOffered}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-[#D2D2D7]/60 bg-white">
            <span className="text-[#6E6E73] block text-[11px]">Air Conditioning</span>
            <span className="font-semibold text-[#1D1D1F]">
              {ride.acAvailable ? 'Available' : 'No AC'}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-[#D2D2D7]/60 bg-white">
            <span className="text-[#6E6E73] block text-[11px]">Luggage Space</span>
            <span className="font-semibold text-[#1D1D1F] capitalize">
              {ride.luggageAllowance} bag
            </span>
          </div>
        </div>
      </div>

      {/* Ride Creator Profile Card (Single Student Role) */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4">
          Ride Creator Profile
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={
                ride.creator?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80'
              }
              alt={ride.creator?.fullName}
              className="w-14 h-14 rounded-full object-cover border border-[#D2D2D7]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-base text-[#1D1D1F]">{ride.creator?.fullName}</h4>
                <span className="text-xs text-emerald-600 flex items-center gap-0.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                </span>
              </div>
              <p className="text-xs text-[#6E6E73]">{ride.creator?.college}</p>
              <p className="text-xs text-[#6E6E73] mt-0.5">{ride.creator?.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/messages"
              className="px-4 py-2 rounded-xl border border-[#D2D2D7] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-[#0071E3]" />
              <span>Message</span>
            </Link>
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-xl border border-[#D2D2D7] text-xs text-[#6E6E73] hover:text-red-600 hover:bg-red-50 transition"
              title="Report Concern"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cost Sharing Breakdown & Sticky Booking Bar */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
            Student Cost Sharing
          </span>
          <div className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
            {formatINR(ride.pricePerSeat)}
            <span className="text-xs font-normal text-[#6E6E73] ml-1.5">
              per passenger seat ({ride.pricingType === 'shared' ? 'Shared split' : 'Fixed contribution'})
            </span>
          </div>
          <p className="text-[11px] text-[#86868B] mt-0.5">
            Directly contributed to the student creator via UPI during travel. No middleman fees.
          </p>
        </div>

        <div>
          {isCreator ? (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition"
            >
              Cancel My Ride
            </button>
          ) : (
            <button
              onClick={() => setShowBookModal(true)}
              disabled={isFull || isCancelled}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#0071E3]/20 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Book Seat</span>
            </button>
          )}
        </div>
      </div>

      {/* Community Ratings & Reviews */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider">
          Student Community Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-xs text-[#6E6E73]">
            No reviews yet for this student. Reviews appear after trips are completed.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-3.5 rounded-2xl bg-[#F5F5F7] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1D1D1F]">{rev.reviewerName}</span>
                  <div className="flex items-center text-amber-500 gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-[#6E6E73]">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instant Book Modal */}
      {showBookModal && (
        <InstantBookModal
          ride={ride}
          onClose={() => setShowBookModal(false)}
          onSuccess={() => setShowBookModal(false)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel This Ride?"
        message="Are you sure you want to cancel this journey? Any students who booked a seat will be notified and all seats will be closed."
        confirmText="Yes, Cancel Ride"
        isDestructive={true}
        onConfirm={handleCancelRide}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D2D2D7] shadow-2xl">
            <h3 className="font-bold text-base text-[#1D1D1F] mb-1">Submit Safety Report</h3>
            <p className="text-xs text-[#6E6E73] mb-4">
              Our campus moderators review all safety and community reports promptly.
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-1">Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7] bg-white"
                >
                  <option value="inappropriate_behaviour">Inappropriate Behaviour</option>
                  <option value="fare_dispute">Fare or Cost Dispute</option>
                  <option value="safety_concern">Driving or Vehicle Safety Concern</option>
                  <option value="no_show">No Show</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide objective details of what happened..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D2D2D7] text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
