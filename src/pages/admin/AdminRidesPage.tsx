import React, { useState } from 'react';
import { rideService, adminService } from '../../services';
import { Ride } from '../../types';
import { formatINR } from '../../utils/costEngine';
import { formatRideDateTime } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Car,
  Search,
  Filter,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AdminRidesPage: React.FC = () => {
  const { showToast } = useToast();
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingRide, setCancellingRide] = useState<Ride | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadRides = () => {
    rideService.getAllRides().then(setRides).catch(console.error);
  };

  React.useEffect(() => {
    loadRides();
  }, []);

  const filteredRides = rides.filter((r) => {
    const matchesSearch =
      r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.creator?.fullName && r.creator.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdminCancel = async () => {
    if (!cancellingRide) return;
    try {
      await adminService.adminCancelRide(
        cancellingRide.id,
        cancelReason || 'Cancelled by safety moderator'
      );
      loadRides();
      showToast('Ride has been cancelled by moderator.', 'info');
      setCancellingRide(null);
      setCancelReason('');
    } catch {
      showToast('Failed to cancel ride', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Status Filter */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A1A1A6] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by route or creator..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[#6E6E73] font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D2D2D7] bg-white text-xs text-[#1D1D1F]"
          >
            <option value="all">All Rides ({rides.length})</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Rides Table / Cards */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F7] text-[#6E6E73] font-semibold uppercase text-[10px] tracking-wider border-b border-[#D2D2D7]/70">
              <tr>
                <th className="px-5 py-3.5">Route</th>
                <th className="px-4 py-3.5">Schedule</th>
                <th className="px-4 py-3.5">Creator</th>
                <th className="px-4 py-3.5">Seats / Cost</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7]">
              {filteredRides.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F5F7]/40 transition">
                  <td className="px-5 py-3.5 font-semibold text-[#1D1D1F]">
                    {r.origin.split('(')[0]} → {r.destination.split('(')[0]}
                    {r.genderPreference === 'women_only' && (
                      <span className="ml-2 text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                        Women-only
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[#6E6E73]">
                    {r.departureDate} at {r.departureTime}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#1D1D1F]">{r.creator?.fullName}</span>
                    <span className="block text-[11px] text-[#A1A1A6]">{r.vehicleModel}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[#0071E3]">{formatINR(r.pricePerSeat)}</span>
                    <span className="block text-[11px] text-[#6E6E73]">
                      {r.seatsRemaining} of {r.seatsOffered} seats left
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                        r.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'full'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : r.status === 'cancelled'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-gray-100 text-[#6E6E73]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {r.status !== 'cancelled' && r.status !== 'completed' && (
                      <button
                        onClick={() => setCancellingRide(r)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs border border-red-200 transition"
                      >
                        Cancel Ride
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Cancel Modal */}
      {cancellingRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#D2D2D7] shadow-xl text-xs">
            <h3 className="font-bold text-base text-red-600 mb-1">Cancel Ride as Moderator</h3>
            <p className="text-[#6E6E73] mb-4">
              Enter a moderation note explaining why this ride is being cancelled.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason (e.g. Schedule conflict, report investigation)..."
                className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCancellingRide(null)}
                  className="px-4 py-2 rounded-xl border border-[#D2D2D7] text-[#1D1D1F]"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleAdminCancel}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
