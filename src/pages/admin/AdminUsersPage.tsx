import React, { useState } from 'react';
import { authService, adminService } from '../../services';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Mail,
  UserX,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(authService.getAllUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSuspension = async () => {
    if (!suspendingUser) return;
    try {
      const updated = await adminService.toggleUserSuspension(suspendingUser.id);
      setUsers(authService.getAllUsers());
      showToast(
        `Account for ${updated.fullName} is now ${updated.isSuspended ? 'suspended' : 'restored'}.`,
        'info'
      );
      setSuspendingUser(null);
    } catch {
      showToast('Failed to update suspension status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1D1D1F]">Student User Directory</h2>
          <p className="text-xs text-[#6E6E73]">{users.length} registered students</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A1A1A6] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
          />
        </div>
      </div>

      {/* Users Table / Mobile Cards */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F7] text-[#6E6E73] font-semibold uppercase text-[10px] tracking-wider border-b border-[#D2D2D7]/70">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Gender / Reg No</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F5F5F7]/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-[#D2D2D7]"
                      />
                      <div>
                        <div className="font-semibold text-xs text-[#1D1D1F]">{u.fullName}</div>
                        <div className="text-[11px] text-[#6E6E73]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize">{u.gender}</span>
                    {u.regNumber && <span className="text-[#A1A1A6] ml-1">({u.regNumber})</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                        u.role === 'admin' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.isSuspended ? (
                      <span className="text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px]">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => setSuspendingUser(u)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                          u.isSuspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {u.isSuspended ? 'Restore' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!suspendingUser}
        title={suspendingUser?.isSuspended ? 'Restore Student Account?' : 'Suspend Student Account?'}
        message={`Are you sure you want to ${
          suspendingUser?.isSuspended ? 'restore access for' : 'suspend'
        } ${suspendingUser?.fullName}? Suspended accounts cannot log in or participate in carpools.`}
        confirmText={suspendingUser?.isSuspended ? 'Restore Account' : 'Suspend Account'}
        isDestructive={!suspendingUser?.isSuspended}
        onConfirm={handleToggleSuspension}
        onCancel={() => setSuspendingUser(null)}
      />
    </div>
  );
};
