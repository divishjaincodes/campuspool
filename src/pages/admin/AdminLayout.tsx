import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Car,
  Flag,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#1D1D1F]">
                CampusPool Administration
              </h1>
              <span className="text-[10px] font-bold bg-[#1D1D1F] text-white px-2 py-0.5 rounded-full uppercase">
                Demo Admin
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              VIT Bhopal University Community Safety & Moderation Cell
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
        </Link>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold border-b border-[#D2D2D7]/60 pb-3">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-sm'
                : 'bg-white border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`
          }
        >
          <BarChart3 className="w-4 h-4" /> Overview
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-sm'
                : 'bg-white border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`
          }
        >
          <Users className="w-4 h-4" /> Users
        </NavLink>

        <NavLink
          to="/admin/rides"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-sm'
                : 'bg-white border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`
          }
        >
          <Car className="w-4 h-4" /> Rides
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-sm'
                : 'bg-white border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`
          }
        >
          <Flag className="w-4 h-4" /> Safety Reports
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-sm'
                : 'bg-white border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`
          }
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </NavLink>
      </div>

      {/* Admin Content Area */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};
