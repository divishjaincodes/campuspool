import React, { useState } from 'react';
import { Ride } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services';
import { formatINR } from '../../utils/costEngine';
import {
  X,
  Shield,
  AlertCircle,
  CheckCircle2,
  Users,
  Car,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InstantBookModalProps {
  ride: Ride;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InstantBookModal: React.FC<InstantBookModalProps> = ({
  ride,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [seatsRequested, setSeatsRequested] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-sm text-[#1D1D1F] font-semibold mb-4">Please log in to book this seat.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 bg-[#0071E3] text-white rounded-xl text-xs font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Self-booking check
  const isCreator = currentUser.id === ride.creatorId;

  // Women-only check
  const isWomenOnly = ride.genderPreference === 'women_only';
  const isGenderIneligible = isWomenOnly && currentUser.gender !== 'female';

  const totalCost = ride.pricePerSeat * seatsRequested;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isCreator) {
      setErrorMessage('You created this ride; you cannot book a seat on your own vehicle.');
      return;
    }

    if (isGenderIneligible) {
      setErrorMessage(
        'This ride is reserved exclusively for female students according to community guidelines.'
      );
      return;
    }

    if (seatsRequested > ride.seatsRemaining) {
      setErrorMessage(`Only ${ride.seatsRemaining} seat(s) remaining.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingService.createBooking({
        rideId: ride.id,
        passengerId: currentUser.id,
        seatsRequested,
        message,
      });

      showToast(`Success! ${seatsRequested} seat(s) booked instantly.`, 'success');
      if (onSuccess) onSuccess();
      onClose();
      navigate('/my-trips');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#D2D2D7]/80 w-full max-w-md p-5 sm:p-6 z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Instant Seat Booking</h3>
              <p className="text-xs text-[#6E6E73]">Direct confirmation • No waiting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Journey Summary */}
        <div className="my-4 p-3.5 bg-[#F5F5F7] rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-[#1D1D1F]">
            <span className="truncate">{ride.origin.split('(')[0].trim()}</span>
            <span>→</span>
            <span className="truncate">{ride.destination.split('(')[0].trim()}</span>
          </div>

          <div className="flex items-center gap-3 text-[#6E6E73] pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
              {ride.departureDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#6E6E73]" />
              {ride.departureTime}
            </span>
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#6E6E73]" />
              {ride.vehicleModel || ride.vehicleType}
            </span>
          </div>
        </div>

        {/* Warning / Restriction Banners */}
        {isCreator && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>You are the creator of this ride. You do not need to book your own ride.</span>
          </div>
        )}

        {isWomenOnly && (
          <div
            className={`mb-4 p-3 rounded-2xl border text-xs flex items-start gap-2 ${
              isGenderIneligible
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Women-Only Ride</p>
              <p className="text-[11px] mt-0.5">
                {isGenderIneligible
                  ? 'This ride is restricted to female students. Your profile is currently registered as male or undisclosed.'
                  : 'Your self-declared profile meets the criteria for this women-only ride.'}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          {/* Seat Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Select Number of Seats
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(ride.seatsRemaining, 4) }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSeatsRequested(num)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      seatsRequested === num
                        ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-sm'
                        : 'bg-white border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
                    }`}
                  >
                    {num} {num === 1 ? 'Seat' : 'Seats'}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Note to Ride Creator <span className="font-normal text-[#6E6E73]">(Optional)</span>
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Carrying a backpack, will wait at ISBT gate"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] placeholder:text-[#A1A1A6] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3]"
            />
          </div>

          {/* Transparent Cost Breakdown */}
          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/60 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#6E6E73]">
              <span>Agreed contribution per seat</span>
              <span>{formatINR(ride.pricePerSeat)}</span>
            </div>
            <div className="flex justify-between text-[#6E6E73]">
              <span>Seats requested</span>
              <span>× {seatsRequested}</span>
            </div>
            <div className="pt-2 border-t border-[#D2D2D7]/60 flex justify-between font-bold text-sm text-[#1D1D1F]">
              <span>Total Estimated Contribution</span>
              <span className="text-[#0071E3]">{formatINR(totalCost)}</span>
            </div>
            <p className="text-[10px] text-[#86868B] pt-1">
              * Payment is settled directly between students in cash or UPI during travel. No money is charged on CampusPool.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCreator || isGenderIneligible || ride.seatsRemaining === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0071E3]/20 transition flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Confirm ({formatINR(totalCost)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
