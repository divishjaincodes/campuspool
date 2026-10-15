import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, PlusCircle, Car, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Hide bottom nav on login, signup, forgot-password, or when not logged in
  const hideOnPaths = ['/login', '/signup', '/forgot-password'];
  if (!currentUser || hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-lg border-t border-[#D2D2D7]/80 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-5 h-14 items-center px-1 max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition ${
              isActive ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight">Home</span>
        </NavLink>

        {/* 2. Find Rides */}
        <NavLink
          to="/rides"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition ${
              isActive ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight">Find</span>
        </NavLink>

        {/* 3. Offer Ride (Center Action) */}
        <NavLink
          to="/create-ride"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition ${
              isActive ? 'text-[#0071E3]' : 'text-[#1D1D1F]'
            }`
          }
        >
          <div className="w-9 h-9 rounded-full bg-[#0071E3] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/25 active:scale-95 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 text-[#0071E3] tracking-tight">Offer</span>
        </NavLink>

        {/* 4. My Trips */}
        <NavLink
          to="/my-trips"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition ${
              isActive ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`
          }
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight">My Trips</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition ${
              isActive ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
