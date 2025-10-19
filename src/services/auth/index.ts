import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { User, LoginRequest, RegisterRequest, GoogleLoginRequest } from '@/types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/api/v1/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },
  
  loginWithGoogle: async (data: GoogleLoginRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/api/v1/auth/login/google', data);
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  }
};

export * from '@/types/auth';