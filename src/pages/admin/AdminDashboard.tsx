import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { AdminStats } from '../../services/supabase/miscServices';
import { Link } from 'react-router-dom';
import {
  Users,
  Car,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeRides: 0,
    totalBookings: 0,
    completedRides: 0,
    openReports: 0,
    popularRoutes: [],
    ridesByStatus: [],
  });

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Students
            </span>
            <Users className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-2">{stats.totalUsers}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Verified accounts</span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Active Rides
            </span>
            <Car className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-2">{stats.activeRides}</div>
          <span className="text-[11px] text-[#6E6E73]">Open or full on platform</span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Bookings
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-2">{stats.totalBookings}</div>
          <span className="text-[11px] text-[#0071E3] font-medium">Instant confirmed</span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Open Safety Reports
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#1D1D1F] mt-2">{stats.openReports}</div>
          <span className="text-[11px] text-amber-600 font-medium">Requires review</span>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F]">Most Popular Commuting Routes</h2>
            <p className="text-xs text-[#6E6E73]">Ranked by student carpool frequency</p>
          </div>
          <Link
            to="/admin/rides"
            className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1"
          >
            <span>Inspect All Rides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#F5F5F7] text-xs">
          {stats.popularRoutes.map((r, index) => (
            <div key={index} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold flex items-center justify-center text-[11px]">
                  #{index + 1}
                </span>
                <span className="font-semibold text-[#1D1D1F]">{r.route}</span>
              </div>
              <span className="font-bold text-[#0071E3] bg-[#0071E3]/5 px-2.5 py-1 rounded-full text-[11px]">
                {r.count} journeys
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
