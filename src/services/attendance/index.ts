import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  AttendanceRecord,
  TodayAttendanceStatus,
  CheckInResponse,
  CheckOutResponse,
} from '@/types/attendance';

export const attendanceApi = {
  // Get attendance history
  getAttendanceHistories: async (): Promise<ApiResponse<AttendanceRecord[]>> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      '/api/v1/employee/attendance/histories'
    );
    return response.data;
  },

  // Get today's attendance status
  getTodayStatus: async (): Promise<ApiResponse<TodayAttendanceStatus>> => {
    const response = await apiClient.get<ApiResponse<TodayAttendanceStatus>>(
      '/api/v1/employee/attendance/today-status'
    );
    return response.data;
  },

  // Check in with face recognition
  checkInFace: async (
    file: File,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<CheckInResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    const response = await apiClient.post<ApiResponse<CheckInResponse>>(
      '/api/v1/employee/attendance/check-in-face',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Check out with face recognition
  checkOutFace: async (
    file: File,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<CheckOutResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    const response = await apiClient.post<ApiResponse<CheckOutResponse>>(
      '/api/v1/employee/attendance/check-out-face',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export * from '@/types/attendance';
