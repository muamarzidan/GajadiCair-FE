import apiClient from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface Employee {
    id: string;
    name: string;
    email: string;
    position: string;
    department_id: string;
    salary: number;
    hire_date: string;
    status: 'active' | 'inactive' | 'terminated';
    created_at: string;
    updated_at: string;
}

export interface CreateEmployeeRequest {
    name: string;
    email: string;
    position: string;
    department_id: string;
    salary: number;
    hire_date: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export const employeeApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: string;
  }): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get('/api/v1/employees', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.get(`/api/v1/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.post('/api/v1/employees', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeRequest): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.put(`/api/v1/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/employees/${id}`);
    return response.data;
  },
};
