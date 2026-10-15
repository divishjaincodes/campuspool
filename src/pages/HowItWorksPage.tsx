import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Coins,
  ShieldCheck,
  Search,
  PlusCircle,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
          How CampusPool Works
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
          A peer-to-peer student carpooling community built specifically for VIT Bhopal University.
        </p>
      </div>

      {/* 3 Step Journey */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-bold text-base text-[#1D1D1F]">Post or Find a Ride</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            Students with a vehicle offer their spare seats. Commuters search by route (Bhopal, Sehore, Ashta) and departure time.
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-bold text-base text-[#1D1D1F]">Instant Confirmation</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            No waiting for manual approvals. As long as seats are available and route restrictions (like Women-only) are satisfied, your booking is confirmed immediately!
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-bold text-base text-[#1D1D1F]">Commute & Share Cost</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            Meet at the designated pickup landmark. Share the journey comfortably, and reimburse fuel costs directly via UPI.
          </p>
        </div>
      </div>

      {/* Cost Sharing Philosophy & Formulas */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 sm:p-8 shadow-sm space-y-5 text-xs">
        <h2 className="text-base font-bold text-[#1D1D1F]">Understanding Our Cost-Sharing Models</h2>
        <p className="text-[#6E6E73] leading-relaxed">
          CampusPool is strictly an academic cost-sharing platform, not a commercial taxi business. Ride creators choose between two transparent pricing models:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/60 space-y-2">
            <h4 className="font-bold text-sm text-[#1D1D1F]">Option A: Fixed Contribution</h4>
            <p className="text-[#6E6E73] leading-relaxed">
              The ride creator sets a fixed amount per passenger seat (e.g. ₹220/seat for Bhopal to campus). The price never changes based on how many students end up booking.
            </p>
            <div className="font-bold text-[#0071E3]">Example: ₹220 per seat</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/60 space-y-2">
            <h4 className="font-bold text-sm text-[#1D1D1F]">Option B: Shared Trip Cost</h4>
            <p className="text-[#6E6E73] leading-relaxed">
              The estimated fuel and toll expenses (e.g. ₹1,000) are split equally among all travelling students (e.g. 4 people = ₹250 each).
            </p>
            <div className="font-bold text-[#0071E3]">Formula: Total Cost ÷ Total Students</div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="p-6 rounded-3xl bg-[#0071E3]/5 border border-[#0071E3]/20 text-center space-y-3">
        <h3 className="font-bold text-base text-[#1D1D1F]">Ready to start carpooling?</h3>
        <p className="text-xs text-[#6E6E73]">
          Join hundreds of VIT Bhopal students saving money and commuting comfortably every week.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/rides"
            className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm"
          >
            Find a Ride
          </Link>
          <Link
            to="/create-ride"
            className="px-5 py-2.5 rounded-xl bg-white border border-[#D2D2D7] text-[#1D1D1F] text-xs font-semibold"
          >
            Offer a Ride
          </Link>
        </div>
      </div>
    </div>
  );
};
