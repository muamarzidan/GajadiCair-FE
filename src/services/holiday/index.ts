import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { 
  Holiday, 
  CreateHolidayRequest, 
  UpdateHolidayRequest 
} from '@/types/holiday';


export const holidayApi = {
  getAll: async (): Promise<ApiResponse<Holiday[]>> => {
    const response = await apiClient.get('/api/v1/company/custom-holiday');
    return response.data;
  },
  getById: async (company_custom_holiday_id: string): Promise<ApiResponse<Holiday>> => {
    const response = await apiClient.get(`/api/v1/company/custom-holiday/${company_custom_holiday_id}`);
    return response.data;
  },
  create: async (data: CreateHolidayRequest): Promise<ApiResponse<Holiday>> => {
    const response = await apiClient.post('/api/v1/company/custom-holiday', data);
    return response.data;
  },
  update: async (
    company_custom_holiday_id: string, 
    data: UpdateHolidayRequest
  ): Promise<ApiResponse<Holiday>> => {
    const response = await apiClient.patch(`/api/v1/company/custom-holiday/${company_custom_holiday_id}`, data);
    return response.data;
  },
  delete: async (company_custom_holiday_id: string): Promise<ApiResponse<Holiday>> => {
    const response = await apiClient.delete(`/api/v1/company/custom-holiday/${company_custom_holiday_id}`);
    return response.data;
  },
};

export * from '@/types/holiday';