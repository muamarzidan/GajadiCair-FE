import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { 
  SubscriptionTransaction, 
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  SubscriptionStatus,
  CheckDowngradeResponse
} from '@/types/subscription';


export const subscriptionApi = {
  createSubscription: async (data: CreateSubscriptionRequest): Promise<ApiResponse<CreateSubscriptionResponse>> => {
    const response = await apiClient.post<ApiResponse<CreateSubscriptionResponse>>(
      '/api/v1/company/subscription',
      data
    );
    return response.data;
  },
  
  getHistory: async (): Promise<ApiResponse<SubscriptionTransaction[]>> => {
    const response = await apiClient.get<ApiResponse<SubscriptionTransaction[]>>(
      '/api/v1/company/subscription'
    );
    return response.data;
  },
  
  getStatus: async (): Promise<ApiResponse<SubscriptionStatus>> => {
    const response = await apiClient.get<ApiResponse<SubscriptionStatus>>(
      '/api/v1/company/subscription/status'
    );
    return response.data;
  },
  
  checkDowngrade: async (): Promise<ApiResponse<CheckDowngradeResponse>> => {
    const response = await apiClient.get<ApiResponse<CheckDowngradeResponse>>(
      '/api/v1/company/subscription/check-downgrade'
    );
    return response.data;
  },
};

export * from '@/types/subscription';
