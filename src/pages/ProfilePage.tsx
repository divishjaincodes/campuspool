import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Phone,
  Car,
  Save,
  Sparkles,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [gender, setGender] = useState<'female' | 'male' | 'undisclosed'>(
    currentUser?.gender || 'undisclosed'
  );
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [vehicleModel, setVehicleModel] = useState(currentUser?.vehicle?.model || '');
  const [vehicleType, setVehicleType] = useState<any>(currentUser?.vehicle?.type || 'Sedan');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        gender,
        phone: phone.trim(),
        bio: bio.trim(),
        vehicle: vehicleModel.trim()
          ? {
              type: vehicleType,
              model: vehicleModel.trim(),
              capacity: 4,
            }
          : undefined,
      });
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Manage your campus identity and commuting preferences
          </p>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.fullName}
          className="w-20 h-20 rounded-full object-cover border-2 border-[#0071E3]/20 shadow-sm"
        />
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-bold text-[#1D1D1F]">{currentUser.fullName}</h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
            </span>
          </div>
          <p className="text-xs text-[#6E6E73] mt-1">{currentUser.college}</p>
          <p className="text-xs text-[#6E6E73]">Email: {currentUser.email}</p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider mb-2">
            Personal Information
          </h3>

          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">
                Self-Declared Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-white text-xs text-[#1D1D1F]"
              >
                <option value="female">Female (Eligible for Women-only rides)</option>
                <option value="male">Male</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
              <p className="text-[10px] text-[#86868B] mt-1">
                Used solely for verifying eligibility for Women-Only rides. Never shown publicly without consent.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98260 12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              />
              <p className="text-[10px] text-[#86868B] mt-1">
                Only shared with confirmed co-passengers for coordination.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1.5">About Me & Commute</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Year, branch, typical commuting times, preferred music..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
            />
          </div>
        </div>

        {/* Vehicle Information (Optional) */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider">
              Vehicle Information
            </h3>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">
              Fill this in if you offer carpooling rides to other students.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">Vehicle Category</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-white text-xs text-[#1D1D1F]"
              >
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="SUV">SUV</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">Vehicle Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Honda City White / Hyundai i20"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-[#0071E3]/20 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
