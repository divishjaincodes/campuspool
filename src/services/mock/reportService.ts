import { SafetyReport, ReportCategory, ReportStatus } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_REPORTS } from '../../data/mockData';
import { authService } from './authService';

export const reportService = {
  getAllReports: (): SafetyReport[] => {
    initStorageIfEmpty();
    const reports = getStorage<SafetyReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    return reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  submitReport: async (params: {
    reporterId: string;
    reportedUserId?: string;
    rideId?: string;
    category: ReportCategory;
    description: string;
  }): Promise<SafetyReport> => {
    initStorageIfEmpty();
    const reports = getStorage<SafetyReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const users = authService.getAllUsers();
    const reporter = users.find((u) => u.id === params.reporterId);
    const reportedUser = params.reportedUserId
      ? users.find((u) => u.id === params.reportedUserId)
      : undefined;

    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      reporterId: params.reporterId,
      reporterName: reporter?.fullName || 'Student',
      reportedUserId: params.reportedUserId,
      reportedUserName: reportedUser?.fullName,
      rideId: params.rideId,
      category: params.category,
      description: params.description.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setStorage(STORAGE_KEYS.REPORTS, [newReport, ...reports]);
    return newReport;
  },

  updateReportStatus: async (
    reportId: string,
    status: ReportStatus,
    resolutionNote?: string
  ): Promise<SafetyReport> => {
    const reports = getStorage<SafetyReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) throw new Error('Report not found');

    const updated = {
      ...reports[index],
      status,
      resolutionNote: resolutionNote !== undefined ? resolutionNote : reports[index].resolutionNote,
    };
    reports[index] = updated;
    setStorage(STORAGE_KEYS.REPORTS, reports);
    return updated;
  },
};
