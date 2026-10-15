import React from 'react';
import { adminService } from '../../services';
import { BarChart3, TrendingUp, Users, Car, CheckCircle2 } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const stats = adminService.getStats();

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm">
        <h2 className="text-base font-bold text-[#1D1D1F]">Platform Analytics & Trends</h2>
        <p className="text-xs text-[#6E6E73]">
          Live insights calculated dynamically from the active mock database
        </p>
      </div>

      {/* Grid of Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ride Status Distribution */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0071E3]" /> Ride Status Breakdown
          </h3>

          <div className="space-y-3">
            {stats.ridesByStatus.map((item, idx) => {
              const total = stats.ridesByStatus.reduce((acc, s) => acc + s.count, 0) || 1;
              const pct = Math.round((item.count / total) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="capitalize text-[#1D1D1F]">{item.status}</span>
                    <span className="text-[#6E6E73]">
                      {item.count} rides ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.status === 'open'
                          ? 'bg-emerald-500'
                          : item.status === 'full'
                          ? 'bg-amber-500'
                          : item.status === 'completed'
                          ? 'bg-blue-500'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Demand Distribution */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0071E3]" /> High-Frequency Commuting Corridors
          </h3>

          <div className="space-y-3">
            {stats.popularRoutes.map((r, idx) => {
              const maxCount = stats.popularRoutes[0]?.count || 1;
              const pct = Math.round((r.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#1D1D1F] truncate">{r.route}</span>
                    <span className="text-[#0071E3] shrink-0 ml-2">{r.count} trips</span>
                  </div>
                  <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0071E3] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campus Community Impact Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm text-xs space-y-3">
        <h3 className="font-bold text-sm text-[#1D1D1F]">Carbon & Cost-Savings Estimation</h3>
        <p className="text-[#6E6E73] leading-relaxed">
          Through student carpooling, approximately <strong>{stats.totalBookings * 65} km</strong> of solo vehicle commuting has been consolidated across VIT Bhopal routes (Bhopal, Sehore, Ashta), lowering commuting emissions and reducing student transit expenses.
        </p>
      </div>
    </div>
  );
};
