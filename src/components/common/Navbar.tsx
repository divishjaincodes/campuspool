import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services';
import {
  Car,
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  Compass,
  MessageSquare,
  User as UserIcon,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      notificationService.getUnreadCount(currentUser.id).then(setUnreadCount).catch(() => setUnreadCount(0));
    } else {
      setUnreadCount(0);
    }
  }, [currentUser, location.pathname]);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#D2D2D7]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0071E3] flex items-center justify-center text-white shadow-sm shadow-[#0071E3]/20 group-hover:scale-105 transition-transform duration-200">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl tracking-tight text-[#1D1D1F]">
              Campus<span className="text-[#0071E3]">Pool</span>
            </span>
            <span className="text-[9px] font-medium tracking-wider uppercase text-[#6E6E73] -mt-1 hidden sm:inline">
              VIT Bhopal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
          <Link
            to="/rides"
            className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition ${
              isActive('/rides')
                ? 'bg-[#0071E3]/10 text-[#0071E3]'
                : 'text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#0071E3]'
            }`}
          >
            Find Rides
          </Link>
          <Link
            to="/create-ride"
            className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition flex items-center gap-1.5 ${
              isActive('/create-ride')
                ? 'bg-[#0071E3] text-white shadow-sm shadow-[#0071E3]/20'
                : 'text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#0071E3]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Offer a Ride</span>
          </Link>
          <Link
            to="/how-it-works"
            className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition ${
              isActive('/how-it-works')
                ? 'bg-[#0071E3]/10 text-[#0071E3]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/safety"
            className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition ${
              isActive('/safety')
                ? 'bg-[#0071E3]/10 text-[#0071E3]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            Safety
          </Link>
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
                title="Notifications"
                aria-label="View Notifications"
              >
                <Bell className="w-5 h-5 text-[#1D1D1F]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Messages Link */}
              <Link
                to="/messages"
                className="p-2 rounded-full text-[#1D1D1F] hover:bg-[#F5F5F7] transition hidden sm:flex"
                title="Messages"
                aria-label="View Messages"
              >
                <MessageSquare className="w-5 h-5 text-[#1D1D1F]" />
              </Link>

              {/* User Dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#0071E3]/30 transition"
                  aria-label="User Menu"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-[#D2D2D7]/80"
                  />
                  <span className="text-xs font-semibold text-[#1D1D1F] hidden lg:inline max-w-[100px] truncate">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#D2D2D7]/70 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-2 border-b border-[#F5F5F7]">
                        <p className="text-xs font-semibold text-[#1D1D1F] truncate">
                          {currentUser.fullName}
                        </p>
                        <p className="text-[11px] text-[#6E6E73] truncate">{currentUser.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
                        >
                          <Compass className="w-4 h-4 text-[#6E6E73]" />
                          Dashboard
                        </Link>
                        <Link
                          to="/my-trips"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
                        >
                          <Car className="w-4 h-4 text-[#6E6E73]" />
                          My Trips & Bookings
                        </Link>
                        <Link
                          to="/messages"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
                        >
                          <MessageSquare className="w-4 h-4 text-[#6E6E73]" />
                          Messages
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
                        >
                          <UserIcon className="w-4 h-4 text-[#6E6E73]" />
                          Student Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
                        >
                          <Settings className="w-4 h-4 text-[#6E6E73]" />
                          Preferences & Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0071E3] hover:bg-[#0071E3]/5"
                          >
                            <ShieldAlert className="w-4 h-4 text-[#0071E3]" />
                            Admin Console
                          </Link>
                        )}
                        <div className="border-t border-[#F5F5F7] my-1" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#1D1D1F] px-3 py-1.5 rounded-full hover:bg-[#F5F5F7] transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] px-4 py-1.5 rounded-full shadow-sm shadow-[#0071E3]/20 transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#1D1D1F] hover:bg-[#F5F5F7] md:hidden transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#D2D2D7] px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2">
          <Link
            to="/rides"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <Search className="w-4 h-4 text-[#0071E3]" /> Find Rides
          </Link>
          <Link
            to="/create-ride"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <PlusCircle className="w-4 h-4 text-[#0071E3]" /> Offer a Ride
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <HelpCircle className="w-4 h-4 text-[#6E6E73]" /> How It Works
          </Link>
          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safety & Guidelines
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#0071E3] bg-[#0071E3]/5"
            >
              <ShieldAlert className="w-4 h-4 text-[#0071E3]" /> Admin Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
