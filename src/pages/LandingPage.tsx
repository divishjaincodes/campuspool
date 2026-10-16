import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services';
import { Ride } from '../types';
import { RideCard } from '../components/rides/RideCard';
import { InstantBookModal } from '../components/rides/InstantBookModal';
import {
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  Users,
  Coins,
  ChevronRight,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  Shield,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selectedRideForBook, setSelectedRideForBook] = useState<Ride | null>(null);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRides(true);
    rideService
      .getAllRides()
      .then((rides) => {
        if (isMounted) {
          setUpcomingRides(rides.filter((r) => r.status === 'open').slice(0, 4));
        }
      })
      .catch((err) => {
        console.error('Failed fetching landing rides:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRides(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set('origin', origin);
    if (destination) params.set('destination', destination);
    if (date) params.set('date', date);
    navigate(`/rides?${params.toString()}`);
  };

  const handleQuickRoute = (from: string, to: string) => {
    navigate(`/rides?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Hero Section - Apple-Inspired Minimalism */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F7] border-b border-[#D2D2D7]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Tagline Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-xs font-semibold mb-6 tracking-wide animate-in fade-in slide-in-from-top-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIT Bhopal Student Carpooling</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
            Your journey. <span className="text-[#0071E3]">Shared.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#6E6E73] max-w-2xl mx-auto leading-relaxed">
            Find fellow students travelling your way. Share the ride cost. Make campus commuting more affordable, convenient, and safe.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/rides"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm shadow-md shadow-[#0071E3]/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Find a Ride</span>
            </Link>
            <Link
              to="/create-ride"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFFFFF] border border-[#D2D2D7] hover:border-[#0071E3]/60 text-[#1D1D1F] font-semibold text-sm shadow-sm active:scale-95 transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#0071E3]" />
              <span>Offer a Ride</span>
            </Link>
          </div>

          {/* Compact Mobile-First Route Search Widget */}
          <div className="mt-8 sm:mt-12 bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/70 p-4 sm:p-5 shadow-xl max-w-3xl mx-auto text-left">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">
                  From (Pickup)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#A1A1A6] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Bhopal, Sehore..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-1">
                  To (Destination)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#0071E3] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="VIT Bhopal Campus..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Search className="w-4 h-4" /> Search Rides
                </button>
              </div>
            </form>

            {/* Common Route Quick Chips */}
            <div className="mt-3 pt-3 border-t border-[#F5F5F7] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#6E6E73] text-[11px] font-medium">Quick Routes:</span>
              <button
                type="button"
                onClick={() => handleQuickRoute('Bhopal', 'VIT Bhopal')}
                className="px-2.5 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-[11px] font-medium transition cursor-pointer"
              >
                Bhopal → VIT Bhopal
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoute('Sehore', 'VIT Bhopal')}
                className="px-2.5 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-[11px] font-medium transition cursor-pointer"
              >
                Sehore → VIT Bhopal
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoute('VIT Bhopal', 'Bhopal')}
                className="px-2.5 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-[11px] font-medium transition cursor-pointer"
              >
                VIT Bhopal → Bhopal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Available Upcoming Rides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
              Upcoming Available Rides
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
              Instant bookings available from fellow VIT Bhopal students.
            </p>
          </div>
          <Link
            to="/rides"
            className="text-xs sm:text-sm font-semibold text-[#0071E3] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingRides ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#D2D2D7]/70 p-5 space-y-4 animate-pulse shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-[#E5E5EA] rounded-full w-1/3" />
                  <div className="h-4 bg-[#E5E5EA] rounded-full w-1/5" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[#E5E5EA] rounded-full w-3/4" />
                  <div className="h-3 bg-[#E5E5EA] rounded-full w-1/2" />
                </div>
                <div className="h-8 bg-[#E5E5EA] rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : upcomingRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onBookClick={(r) => setSelectedRideForBook(r)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#D2D2D7]/80 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#1D1D1F]">No rides scheduled yet</h3>
              <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
                Commuting between Bhopal, Sehore, or the VIT campus soon? Be the first student to publish a journey!
              </p>
            </div>
            <Link
              to="/create-ride"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer a Ride</span>
            </Link>
          </div>
        )}
      </section>

      {/* 3. How It Works - 3 Step Process */}
      <section className="bg-[#FFFFFF] py-12 border-y border-[#D2D2D7]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
              How CampusPool Works
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
              One student account for everything. Direct, transparent cost sharing in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Find or Offer a Ride</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Search available rides along your commuting route or offer your vehicle seats with your agreed fuel contribution.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                2
              </div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Instant Seat Confirmation</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Book open seats with automatic confirmation. Seat availability updates instantly to prevent overbooking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                3
              </div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Commute & Share Costs</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Meet at the pickup point, commute comfortably, and split the fuel or toll costs directly between students via UPI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Safety & Women-Only Feature Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-rose-50/50 to-white rounded-3xl border border-rose-200/80 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>Campus Safety Priority</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Women-Only Carpooling
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
              Female students can select the Women-Only preference when creating or finding rides. Our platform automatically enforces eligibility based on verified profile registration.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/rides?genderPreference=women_only"
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Browse Women-Only Rides
              </Link>
              <Link
                to="/safety"
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-800 text-xs font-semibold hover:bg-rose-50 transition"
              >
                Safety Guidelines
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-white rounded-2xl border border-rose-200/80 p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Student Verification
            </h4>
            <div className="space-y-2 text-[#6E6E73]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>@vitbhopal.ac.in official emails</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero commercial taxi surge fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct student-to-student messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Community reporting & safety team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#6E6E73] mt-1">
            Everything you need to know about student carpooling at VIT Bhopal.
          </p>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <details className="group bg-white rounded-2xl border border-[#D2D2D7]/60 p-4 transition">
            <summary className="font-semibold text-[#1D1D1F] cursor-pointer list-none flex justify-between items-center">
              <span>Do I need a separate Driver account to offer a ride?</span>
              <ChevronRight className="w-4 h-4 text-[#6E6E73] group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-[#6E6E73] leading-relaxed border-t border-[#F5F5F7] pt-2">
              No! CampusPool uses a single student account. Any registered student can offer rides when travelling by car or book seats on rides posted by batchmates.
            </p>
          </details>

          <details className="group bg-white rounded-2xl border border-[#D2D2D7]/60 p-4 transition">
            <summary className="font-semibold text-[#1D1D1F] cursor-pointer list-none flex justify-between items-center">
              <span>How does instant seat booking work?</span>
              <ChevronRight className="w-4 h-4 text-[#6E6E73] group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-[#6E6E73] leading-relaxed border-t border-[#F5F5F7] pt-2">
              When you find a ride with open seats that matches your route, clicking Instant Book reserves your seat immediately. The ride creator is notified right away, and available seats are updated automatically.
            </p>
          </details>

          <details className="group bg-white rounded-2xl border border-[#D2D2D7]/60 p-4 transition">
            <summary className="font-semibold text-[#1D1D1F] cursor-pointer list-none flex justify-between items-center">
              <span>How is payment handled?</span>
              <ChevronRight className="w-4 h-4 text-[#6E6E73] group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs text-[#6E6E73] leading-relaxed border-t border-[#F5F5F7] pt-2">
              CampusPool does not charge payment processing fees or hold funds. The agreed contribution (e.g. ₹200) is paid directly by the passenger to the ride creator using UPI or cash during the journey.
            </p>
          </details>
        </div>
      </section>

      {/* Instant Book Modal */}
      {selectedRideForBook && (
        <InstantBookModal
          ride={selectedRideForBook}
          onClose={() => setSelectedRideForBook(null)}
          onSuccess={() => setSelectedRideForBook(null)}
        />
      )}
    </div>
  );
};
