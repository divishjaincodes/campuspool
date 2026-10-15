import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService, bookingService, notificationService } from '../services';
import { formatINR } from '../utils/costEngine';
import { formatRideDate } from '../utils/dateUtils';
import {
  Car,
  Search,
  PlusCircle,
  Calendar,
  Clock,
  Users,
  Bell,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const myRides = rideService.getRidesCreatedBy(currentUser.id);
  const myBookings = bookingService.getBookingsByPassenger(currentUser.id);
  const notifications = notificationService.getUserNotifications(currentUser.id).slice(0, 3);

  const activeRides = myRides.filter((r) => r.status === 'open' || r.status === 'full');
  const confirmedBookings = myBookings.filter((b) => b.status === 'confirmed');

  // Next upcoming ride (either created or booked)
  const nextRide = activeRides[0];
  const nextBooking = confirmedBookings[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#0071E3]/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
                Welcome back, {currentUser.fullName.split(' ')[0]}!
              </h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              {currentUser.college} • Single Student Account
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/create-ride"
            className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Offer Ride
          </Link>
          <Link
            to="/rides"
            className="px-4 py-2.5 rounded-xl border border-[#D2D2D7] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-[#0071E3]" /> Find Ride
          </Link>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
            Rides I Created
          </span>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-1">{myRides.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {activeRides.length} active currently
          </span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
            Rides I Booked
          </span>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-1">{myBookings.length}</div>
          <span className="text-[11px] text-[#0071E3] font-medium">
            {confirmedBookings.length} confirmed
          </span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
            Total Passengers Hosted
          </span>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-1">
            {myRides.reduce((acc, r) => acc + (r.seatsOffered - r.seatsRemaining), 0)}
          </div>
          <span className="text-[11px] text-[#6E6E73]">Shared campus journeys</span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
            Account Status
          </span>
          <div className="text-base font-bold text-emerald-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Active Student
          </div>
          <span className="text-[11px] text-[#6E6E73]">Campus Verified</span>
        </div>
      </div>

      {/* Next Upcoming Trip Card */}
      {(nextRide || nextBooking) && (
        <div className="bg-gradient-to-r from-[#0071E3]/5 to-transparent rounded-3xl border border-[#0071E3]/20 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#0071E3]" />
            <h3 className="font-bold text-sm text-[#1D1D1F]">Next Upcoming Journey</h3>
          </div>

          {nextRide ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-sm text-[#1D1D1F]">
                  {nextRide.origin} → {nextRide.destination}
                </p>
                <p className="text-[#6E6E73] mt-0.5">
                  Role: Ride Creator • {formatRideDate(nextRide.departureDate)} at {nextRide.departureTime}
                </p>
              </div>
              <Link
                to={`/rides/${nextRide.id}`}
                className="px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold text-xs text-center shadow-sm"
              >
                View Details
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-sm text-[#1D1D1F]">
                  {nextBooking?.ride?.origin} → {nextBooking?.ride?.destination}
                </p>
                <p className="text-[#6E6E73] mt-0.5">
                  Role: Passenger ({nextBooking?.seatsBooked} seat confirmed)
                </p>
              </div>
              <Link
                to="/my-trips"
                className="px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold text-xs text-center shadow-sm"
              >
                View My Trips
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Trips & Notifications Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: My Recent Rides & Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1D1D1F]">My Active Carpools</h3>
            <Link to="/my-trips" className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1">
              <span>View All Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myRides.length === 0 && myBookings.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-6 text-center text-xs text-[#6E6E73]">
              You have no active rides or bookings yet. Search for a ride or offer one!
            </div>
          ) : (
            <div className="space-y-3">
              {myRides.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 flex items-center justify-between gap-3 text-xs shadow-sm hover:border-[#0071E3]/40 transition"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                      Posted By You
                    </span>
                    <p className="font-bold text-sm text-[#1D1D1F] mt-1">
                      {r.origin.split('(')[0]} → {r.destination.split('(')[0]}
                    </p>
                    <p className="text-[#6E6E73]">
                      {r.departureDate} at {r.departureTime} • {r.seatsRemaining} of {r.seatsOffered} seats remaining
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-[#1D1D1F]">{formatINR(r.pricePerSeat)}</p>
                    <Link to={`/rides/${r.id}`} className="text-[11px] text-[#0071E3] hover:underline">
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1D1D1F]">Recent Activity</h3>
            <Link to="/notifications" className="text-xs font-semibold text-[#0071E3] hover:underline">
              All
            </Link>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 space-y-3 shadow-sm">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#6E6E73] text-center py-4">No recent notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="pb-3 border-b border-[#F5F5F7] last:border-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1D1D1F]">{n.title}</span>
                    <span className="text-[10px] text-[#A1A1A6]">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#6E6E73] mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
