import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resetDemoData } from '../services';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  RotateCcw,
  Bell,
  Shield,
  LogOut,
  Users,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { currentUser, switchUser, refreshUser, allUsers } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  if (!currentUser) return null;

  const handleResetData = () => {
    resetDemoData();
    refreshUser();
    showToast('Demo dataset has been restored to factory seed state.', 'success');
    setShowResetModal(false);
  };

  const handleLogout = () => {
    showToast('Signed out of demo session.', 'info');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-[#6E6E73] mt-0.5">
          Configure notifications, switch test students, and manage demo storage
        </p>
      </div>

      {/* Demo Switcher Box */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-3 text-xs">
        <h2 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0071E3]" />
          Demo Student Accounts
        </h2>
        <p className="text-[#6E6E73]">
          Quickly switch between registered students to test instant booking, women-only restrictions, and ride offering.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                showToast(`Switched to ${u.fullName}`, 'info');
              }}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                u.id === currentUser.id
                  ? 'border-[#0071E3] bg-[#0071E3]/5 font-semibold text-[#0071E3]'
                  : 'border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <div className="truncate">
                <p className="font-bold">{u.fullName}</p>
                <p className="text-[10px] text-[#6E6E73] capitalize">
                  {u.gender} • {u.role}
                </p>
              </div>
              {u.id === currentUser.id && <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />}
            </button>
          ))}
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
            className="w-4 h-4 accent-[#0071E3]"
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
            className="w-4 h-4 accent-[#0071E3]"
          />
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-red-50/50 rounded-3xl border border-red-200 p-6 space-y-3 text-xs">
        <h2 className="font-bold text-sm text-red-700 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Prototype Data Management
        </h2>
        <p className="text-red-600/90 leading-relaxed">
          Resetting will clear all newly added rides and bookings, restoring the fresh default seed dataset.
        </p>

        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          Reset Demo Dataset
        </button>
      </div>

      {/* Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All Prototype Data?"
        message="This action will restore all default seed rides, instant bookings, and users. Any rides created in this session will be reverted."
        confirmText="Yes, Reset"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
