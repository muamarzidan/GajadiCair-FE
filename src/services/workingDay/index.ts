import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { WorkingDay, UpdateWorkingDayRequest } from '@/types/workingDay';

export const workingDayApi = {
  getWorkingDay: async (): Promise<ApiResponse<WorkingDay>> => {
    const response = await apiClient.get<ApiResponse<WorkingDay>>(
      '/api/v1/company/working-day'
    );
    return response.data;
  },
  updateWorkingDay: async (
    data: UpdateWorkingDayRequest
  ): Promise<ApiResponse<WorkingDay>> => {
    const response = await apiClient.put<ApiResponse<WorkingDay>>(
      '/api/v1/company/working-day',
      data
    );
    return response.data;
  },
};

export * from '@/types/workingDay';
