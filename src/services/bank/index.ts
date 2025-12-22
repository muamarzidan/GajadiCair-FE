import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  Bank,
} from '@/types/bank';

export const bankApi = {
  getBanks: async (): Promise<ApiResponse<Bank[]>> => {
    const response = await apiClient.get<ApiResponse<Bank[]>>(
      '/api/v1/bank'
    );
    return response.data;
  },
};

export * from '@/types/bank';