import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { 
  Employee, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest,
  GetAllEmployeesResponse
} from '@/types/employee';


export const employeeApi = {
  getAll: async (): Promise<ApiResponse<GetAllEmployeesResponse>> => {
    const response = await apiClient.get('/api/v1/company/employee');
    return response.data;
  },

  getById: async (employeeId: string): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.get(`/api/v1/company/employee/${employeeId}`);
    return response.data;
  },

  create: async (data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.post('/api/v1/company/employee', data);
    return response.data;
  },

  update: async (
    employeeId: string, 
    data: UpdateEmployeeRequest
  ): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.patch(`/api/v1/company/employee/${employeeId}`, data);
    return response.data;
  },

  delete: async (employeeId: string): Promise<ApiResponse<Employee>> => {
    const response = await apiClient.delete(`/api/v1/company/employee/${employeeId}`);
    return response.data;
  },
};

export * from '@/types/employee';