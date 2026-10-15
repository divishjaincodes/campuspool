import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resetDemoData } from '../../services';
import { RotateCcw, Users, Check, Sparkles, ChevronDown } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { currentUser, allUsers, switchUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!currentUser) return null;

  const handleSelectUser = (userId: string) => {
    try {
      const u = switchUser(userId);
      showToast(`Switched account to ${u.fullName} (${u.role === 'admin' ? 'Admin' : 'Student'})`, 'info');
      setIsOpen(false);
    } catch {
      showToast('Failed to switch user', 'error');
    }
  };

  const handleResetData = () => {
    resetDemoData();
    refreshUser();
    showToast('Demo dataset reset to initial state successfully', 'success');
    setShowConfirmReset(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Demo Notification Pill */}
      <div className="bg-[#1D1D1F] text-[#F5F5F7] px-3.5 py-1.5 text-xs flex items-center justify-between z-40 border-b border-white/10 select-none">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex items-center gap-1 bg-[#0071E3] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            <Sparkles className="w-2.5 h-2.5" /> Demo Mode
          </span>
          <span className="text-[#6E6E73] hidden sm:inline">Active User:</span>
          <span className="font-medium text-white truncate">{currentUser.fullName}</span>
          <span className="text-[#A1A1A6] text-[11px] hidden md:inline">
            ({currentUser.gender === 'female' ? 'Female' : currentUser.gender === 'male' ? 'Male' : 'Admin'} • {currentUser.role === 'admin' ? 'Admin' : 'Student'})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch Student</span>
            <ChevronDown className="w-3 h-3 text-[#A1A1A6]" />
          </button>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="p-1 hover:bg-white/10 rounded-full text-[#A1A1A6] hover:text-white transition cursor-pointer"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Switcher Modal / Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#D2D2D7]/60 w-full max-w-md p-5 z-10 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F7]">
              <div>
                <h3 className="font-semibold text-base text-[#1D1D1F]">Demo Account Switcher</h3>
                <p className="text-xs text-[#6E6E73]">
                  Test carpooling scenarios as different students or admin.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-[#0071E3] hover:underline"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {allUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                let subtext = 'Student';
                if (u.id === 'usr_aarav') subtext = 'Student (Has Honda City, created rides)';
                if (u.id === 'usr_ananya') subtext = 'Female Student (Created Women-only ride)';
                if (u.id === 'usr_rohan') subtext = 'Male Student (Commutes from Bhopal)';
                if (u.id === 'usr_priya') subtext = 'Female Student (Looking for Women-only rides)';
                if (u.role === 'admin') subtext = 'CampusPool Administrator';

                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-[#0071E3] bg-[#0071E3]/5'
                        : 'border-[#D2D2D7]/50 hover:bg-[#F5F5F7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-[#D2D2D7]/40"
                      />
                      <div>
                        <div className="font-semibold text-sm text-[#1D1D1F] flex items-center gap-2">
                          {u.fullName}
                          {u.role === 'admin' && (
                            <span className="text-[10px] font-medium bg-[#1D1D1F] text-white px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#6E6E73]">{subtext}</div>
                        <div className="text-[11px] text-[#A1A1A6]">{u.email}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[#0071E3] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F5F5F7] flex items-center justify-between">
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Dataset
              </button>
              <span className="text-[11px] text-[#6E6E73]">localStorage v1</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#D2D2D7] p-6 max-w-sm w-full">
            <h3 className="font-semibold text-base text-[#1D1D1F]">Reset All Demo Data?</h3>
            <p className="text-xs text-[#6E6E73] mt-2 leading-relaxed">
              This will restore all sample rides, instant bookings, notifications, and demo accounts back to their fresh seed state.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
