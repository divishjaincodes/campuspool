import React from 'react';
import { Link } from 'react-router-dom';
import { Ride } from '../../types';
import { GenderBadge } from './GenderBadge';
import { formatINR } from '../../utils/costEngine';
import { formatRideDate } from '../../utils/dateUtils';
import {
  Clock,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RideCardProps {
  ride: Ride;
  onBookClick?: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onBookClick }) => {
  const isFull = ride.status === 'full' || ride.seatsRemaining === 0;
  const isCancelled = ride.status === 'cancelled';
  const isCompleted = ride.status === 'completed';

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 sm:p-5 hover:border-[#0071E3]/50 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Header: Date, Time & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5F5F7]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
            <span className="flex items-center gap-1 bg-[#F5F5F7] px-2.5 py-1 rounded-full text-[#1D1D1F]">
              <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
              {formatRideDate(ride.departureDate)}
            </span>
            <span className="flex items-center gap-1 bg-[#F5F5F7] px-2.5 py-1 rounded-full text-[#1D1D1F]">
              <Clock className="w-3.5 h-3.5 text-[#6E6E73]" />
              {ride.departureTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <GenderBadge preference={ride.genderPreference} />
            {isFull && (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Full
              </span>
            )}
            {isCancelled && (
              <span className="text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                Cancelled
              </span>
            )}
          </div>
        </div>

        {/* Route Details */}
        <div className="py-4 space-y-3">
          {/* Origin */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-[#0071E3] bg-white" />
              <div className="w-0.5 h-7 bg-[#D2D2D7]/70 my-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#6E6E73] font-medium">Pickup</p>
              <p className="text-sm font-semibold text-[#1D1D1F] truncate">{ride.origin}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3 -mt-2">
            <div className="w-3 h-3 rounded-full bg-[#0071E3] mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#6E6E73] font-medium">Destination</p>
              <p className="text-sm font-semibold text-[#1D1D1F] truncate">{ride.destination}</p>
            </div>
          </div>

          {/* Intermediate stops pill if any */}
          {ride.intermediateStops && ride.intermediateStops.length > 0 && (
            <div className="pt-1 flex items-center gap-1 text-[11px] text-[#6E6E73]">
              <MapPin className="w-3 h-3 text-[#A1A1A6] shrink-0" />
              <span className="truncate">Via: {ride.intermediateStops.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Creator info, Pricing & Instant Booking */}
      <div className="pt-3 border-t border-[#F5F5F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Creator Info (Single Student Role: Ride Creator / Posted By) */}
        <div className="flex items-center gap-2.5">
          <img
            src={
              ride.creator?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80'
            }
            alt={ride.creator?.fullName || 'Student'}
            className="w-8 h-8 rounded-full object-cover border border-[#D2D2D7]/60"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#1D1D1F]">
                {ride.creator?.fullName || 'VIT Student'}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">✓</span>
            </div>
            <p className="text-[10px] text-[#6E6E73]">
              Ride Creator • {ride.vehicleModel || ride.vehicleType}
            </p>
          </div>
        </div>

        {/* Pricing & Booking CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="text-left sm:text-right">
            <div className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight">
              {formatINR(ride.pricePerSeat)}
              <span className="text-xs font-normal text-[#6E6E73] ml-1">/ seat</span>
            </div>
            <div className="text-[11px] text-[#6E6E73] flex items-center sm:justify-end gap-1">
              <Users className="w-3 h-3" />
              <span>
                {ride.seatsRemaining > 0 ? (
                  <strong className="text-emerald-700 font-medium">{ride.seatsRemaining} left</strong>
                ) : (
                  <span className="text-[#A1A1A6]">No seats</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/rides/${ride.id}`}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
            >
              Details
            </Link>

            {onBookClick && !isFull && !isCancelled && !isCompleted && (
              <button
                onClick={() => onBookClick(ride)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm shadow-[#0071E3]/20 active:scale-95 transition"
              >
                Instant Book
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
