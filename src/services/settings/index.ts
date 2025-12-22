import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { AttendanceSettings, UpdateAttendanceSettingsRequest } from '@/types/settings';

export const attendanceSettingsApi = {
  getSettings: async (): Promise<ApiResponse<AttendanceSettings>> => {
    const response = await apiClient.get<ApiResponse<AttendanceSettings>>(
      '/api/v1/company/attendance/setting'
    );

    return response.data;
  },

  updateSettings: async (data: UpdateAttendanceSettingsRequest): Promise<ApiResponse<AttendanceSettings>> => {
    const response = await apiClient.put<ApiResponse<AttendanceSettings>>(
      '/api/v1/company/attendance/setting',
      data
    );

    return response.data;
  },
};
