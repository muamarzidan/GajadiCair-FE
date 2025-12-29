import type { ApiResponse } from '../../types/api';
import type { EmployeeDashboardData, EmployeeDashboardChartData } from '../../types/dashboard-employee';
import apiClient from '../../lib/apiClient';

export const employeeDashboardApi = {
  getDashboardData: async (): Promise<ApiResponse<EmployeeDashboardData>> => {
    const response = await apiClient.get<ApiResponse<EmployeeDashboardData>>('/api/v1/employee/dashboard');
    return response.data;
  },

  getChartData: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<EmployeeDashboardChartData>> => {
    const response = await apiClient.get<ApiResponse<EmployeeDashboardChartData>>(
      `/api/v1/employee/dashboard/chart?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  },
};