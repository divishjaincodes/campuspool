import React, { useState } from 'react';
import { reportService } from '../../services';
import { SafetyReport, ReportStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Flag, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<SafetyReport[]>(reportService.getAllReports());
  const [editingReport, setEditingReport] = useState<SafetyReport | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('resolved');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    try {
      await reportService.updateReportStatus(editingReport.id, newStatus, resolutionNote);
      setReports(reportService.getAllReports());
      showToast(`Report updated to ${newStatus}`, 'success');
      setEditingReport(null);
      setResolutionNote('');
    } catch {
      showToast('Failed to update report', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1D1D1F]">Community Safety Reports</h2>
          <p className="text-xs text-[#6E6E73]">
            {reports.length} total report{reports.length === 1 ? '' : 's'} recorded
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-8 text-center text-xs text-[#6E6E73]">
            <Flag className="w-8 h-8 text-[#A1A1A6] mx-auto mb-2" />
            No safety reports submitted.
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/80 p-5 shadow-sm space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F5F5F7]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1D1D1F] uppercase text-[10px] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <span className="text-[#6E6E73]">
                    Reported by: <strong>{rep.reporterName}</strong>
                  </span>
                  {rep.reportedUserName && (
                    <span className="text-[#6E6E73]">
                      Against: <strong>{rep.reportedUserName}</strong>
                    </span>
                  )}
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                    rep.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : rep.status === 'investigating'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : rep.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-[#6E6E73]'
                  }`}
                >
                  Status: {rep.status}
                </span>
              </div>

              <p className="text-[#1D1D1F] leading-relaxed font-medium bg-[#F5F5F7] p-3 rounded-xl">
                "{rep.description}"
              </p>

              {rep.resolutionNote && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <strong>Moderator Resolution:</strong> {rep.resolutionNote}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setEditingReport(rep);
                    setNewStatus(rep.status);
                    setResolutionNote(rep.resolutionNote || '');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs transition"
                >
                  Update Status / Add Note
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D2D2D7] shadow-xl text-xs">
            <h3 className="font-bold text-base text-[#1D1D1F] mb-1">Update Report Status</h3>
            <p className="text-[#6E6E73] mb-4">
              Report Category: {editingReport.category.replace('_', ' ')}
            </p>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7] bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-1">
                  Resolution Note / Action Taken
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Spoke with students, resolved cost sharing arrangement..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 rounded-xl border border-[#D2D2D7] text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
