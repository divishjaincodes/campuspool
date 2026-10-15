import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#D2D2D7]/60 pt-10 pb-20 md:pb-12 text-[#6E6E73] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#1D1D1F] tracking-tight">
                Campus<span className="text-[#0071E3]">Pool</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#6E6E73]">
              Ride Together. Pay Less. Travel Safer.
              The student-to-student carpooling platform built for VIT Bhopal University.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Verified Community</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider mb-3">
              Carpooling
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/rides" className="hover:text-[#0071E3] transition">
                  Find a Ride
                </Link>
              </li>
              <li>
                <Link to="/create-ride" className="hover:text-[#0071E3] transition">
                  Offer a Ride
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#0071E3] transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/rides?genderPreference=women_only" className="hover:text-[#0071E3] transition">
                  Women-Only Rides
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular routes */}
          <div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider mb-3">
              Popular Routes
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/rides?origin=Bhopal&destination=VIT+Bhopal" className="hover:text-[#0071E3] transition">
                  Bhopal ↔ VIT Bhopal (~65 km)
                </Link>
              </li>
              <li>
                <Link to="/rides?origin=Sehore&destination=VIT+Bhopal" className="hover:text-[#0071E3] transition">
                  Sehore ↔ VIT Bhopal (~35 km)
                </Link>
              </li>
              <li>
                <Link to="/rides?origin=Indore&destination=VIT+Bhopal" className="hover:text-[#0071E3] transition">
                  Indore Bypass ↔ Campus
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider mb-3">
              Safety & Terms
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/safety" className="hover:text-[#0071E3] transition">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#0071E3] transition">
                  Community Code of Conduct
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#0071E3] transition">
                  Student Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-[#D2D2D7]/50 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-[11px] text-[#86868B] max-w-2xl leading-normal">
            CampusPool is an academic cost-sharing prototype for VIT Bhopal students. It does not provide commercial taxi, cab, or transport services. All contributions are direct cost splits between student participants.
          </p>
          <p className="text-[11px] text-[#86868B] shrink-0">
            © {new Date().getFullYear()} CampusPool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
