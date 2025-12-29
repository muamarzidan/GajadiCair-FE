import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { CompanyDashboardData, CompanyDashboardChartData } from '@/types/dashboard-company';

export const companyDashboardApi = {
  getDashboardData: async (): Promise<ApiResponse<CompanyDashboardData>> => {
    const response = await apiClient.get<ApiResponse<CompanyDashboardData>>(
      '/api/v1/company/dashboard'
    );
    return response.data;
  },

  getChartData: async (startDate: string, endDate: string): Promise<ApiResponse<CompanyDashboardChartData>> => {
    const response = await apiClient.get<ApiResponse<CompanyDashboardChartData>>(
      '/api/v1/company/dashboard/chart',
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );
    return response.data;
  },
};

export * from '@/types/dashboard-company';
