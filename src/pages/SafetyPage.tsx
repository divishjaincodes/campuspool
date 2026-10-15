import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  Lock,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SafetyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
          Trust & Safety at CampusPool
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
          Our core mission is to create a safe, respectful, and accountable carpooling network for all students travelling to and from VIT Bhopal University.
        </p>
      </div>

      {/* Emergency Notice Alert */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Important Emergency Protocol</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            CampusPool is a software prototype facilitating student carpooling and is not an emergency-dispatch system. If you or someone else is in immediate danger or requires urgent medical attention, always dial local police (112), national emergency, or VIT Bhopal Campus Security immediately.
          </p>
        </div>
      </div>

      {/* Key Safety Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1D1D1F]">Verified College Identities</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            Every user account requires an active @vitbhopal.ac.in university registration. Unverified anonymous users cannot offer rides or book seats.
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1D1D1F]">Women-Only Ride Preferences</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            Female students can choose to offer or book rides strictly designated as women-only. The system blocks non-eligible accounts automatically at booking time.
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1D1D1F]">Direct Cost-Sharing Transparency</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            Prices are published upfront based on fuel splitting. There are no sudden surge multipliers, commercial markups, or hidden platform charges.
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1D1D1F]">Student Feedback & Reporting</h3>
          <p className="text-[#6E6E73] leading-relaxed">
            Students can rate completed journeys and report safety or conduct violations directly to campus administrators, who have the ability to suspend problematic accounts.
          </p>
        </div>
      </div>

      {/* Safety Checklist for Passengers & Drivers */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 sm:p-8 shadow-sm space-y-4 text-xs">
        <h2 className="text-base font-bold text-[#1D1D1F]">Student Commuter Safety Checklist</h2>
        <ul className="space-y-2.5 text-[#6E6E73]">
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-bold">•</span>
            <span>Always verify the vehicle model and the student's name before boarding.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-bold">•</span>
            <span>Share your estimated trip arrival time with a hostel roommate or family member.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-bold">•</span>
            <span>Wear seatbelts at all times during highway commuting (e.g. Bhopal–Indore Highway).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-bold">•</span>
            <span>Respect co-passengers' comfort, volume preferences, and personal boundaries.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
