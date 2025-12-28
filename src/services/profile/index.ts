import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { UpdateProfileRequest, ChangePasswordRequest, UpdateProfileResponse } from '@/types/profile';

export const companyProfileApi = {
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.profile_picture) {
      formData.append('profile_picture', data.profile_picture);
    }

    const response = await apiClient.put<ApiResponse<UpdateProfileResponse>>(
      '/api/v1/company/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(
      '/api/v1/auth/company/change-password',
      data
    );

    return response.data;
  },
};

export const employeeProfileApi = {
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.profile_picture) {
      formData.append('profile_picture', data.profile_picture);
    }

    const response = await apiClient.put<ApiResponse<UpdateProfileResponse>>(
      '/api/v1/employee/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>(
      '/api/v1/auth/employee/change-password',
      data
    );

    return response.data;
  },
};
