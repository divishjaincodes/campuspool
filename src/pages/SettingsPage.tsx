import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  Shield,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!currentUser) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showToast('Signed out of CampusPool.', 'info');
      navigate('/login');
    } catch {
      showToast('Failed to sign out', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-[#6E6E73] mt-0.5">
          Manage your verified student credentials, notifications, and security session
        </p>
      </div>

      {/* Account Info Box */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#0071E3]" />
          Verified Student Account
        </h2>

        <div className="p-3 rounded-2xl bg-[#F5F5F7] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-bold text-[#1D1D1F] text-sm">{currentUser.fullName}</p>
            <p className="text-[#6E6E73] text-[11px] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0071E3]" />
              {currentUser.email}
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0071E3]" />
          Notification Channels
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-[#F5F5F7]">
          <div>
            <p className="font-semibold text-[#1D1D1F]">Instant In-App Alerts</p>
            <p className="text-[11px] text-[#6E6E73]">
              Receive alerts for seat bookings, cancellations, and messages.
            </p>
          </div>
          <input
            type="checkbox"
            checked={pushNotifs}
            onChange={(e) => setPushNotifs(e.target.checked)}
            className="w-4 h-4 accent-[#0071E3] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-semibold text-[#1D1D1F]">Email Summary Updates</p>
            <p className="text-[11px] text-[#6E6E73]">
              Send trip summaries to your registered VIT Bhopal email address.
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifs}
            onChange={(e) => setEmailNotifs(e.target.checked)}
            className="w-4 h-4 accent-[#0071E3] cursor-pointer"
          />
        </div>
      </div>

      {/* Security & Sign Out Section */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          Session & Security
        </h2>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="font-semibold text-[#1D1D1F]">Sign Out</p>
            <p className="text-[11px] text-[#6E6E73]">
              Sign out of this browser session. You can sign back in anytime.
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
