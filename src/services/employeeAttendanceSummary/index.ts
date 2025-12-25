import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { EmployeeAttendanceSummaryResponse } from '@/types/employeeAttendanceSummary';

export const employeeAttendanceSummaryApi = {
  getSummary: async (
    month: number,
    year: number
  ): Promise<ApiResponse<EmployeeAttendanceSummaryResponse>> => {
    const response = await apiClient.get<ApiResponse<EmployeeAttendanceSummaryResponse>>(
      `/api/v1/employee/attendance/summary?month=${month}&year=${year}`
    );
    return response.data;
  },
};

export * from '@/types/employeeAttendanceSummary';
