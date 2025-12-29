import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { LeaveApplication, CreateLeaveApplicationRequest, UpdateLeaveApplicationStatusRequest } from '@/types/leaveApplication';

// Employee Leave Application APIs
export const employeeLeaveApplicationApi = {
  getLeaveApplications: async (): Promise<ApiResponse<LeaveApplication[]>> => {
    const response = await apiClient.get<ApiResponse<LeaveApplication[]>>(
      '/api/v1/employee/leave-application'
    );
    return response.data;
  },

  createLeaveApplication: async (data: CreateLeaveApplicationRequest): Promise<ApiResponse<LeaveApplication>> => {
    const formData = new FormData();
    formData.append('attachment', data.attachment);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('reason', data.reason);
    formData.append('type', data.type);

    const response = await apiClient.post<ApiResponse<LeaveApplication>>(
      '/api/v1/employee/leave-application',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

// Company Leave Application APIs
export const companyLeaveApplicationApi = {
  getLeaveApplications: async (): Promise<ApiResponse<LeaveApplication[]>> => {
    const response = await apiClient.get<ApiResponse<LeaveApplication[]>>(
      '/api/v1/company/leave-application'
    );
    return response.data;
  },

  updateLeaveApplicationStatus: async (data: UpdateLeaveApplicationStatusRequest): Promise<ApiResponse<LeaveApplication>> => {
    const response = await apiClient.put<ApiResponse<LeaveApplication>>(
      '/api/v1/company/leave-application/status',
      data
    );
    return response.data;
  },
};