import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { ICheckFaceResponse } from '@/types/faceRecognition';

export const faceRecognitionApi = {
  checkFace: async (imageFile: File): Promise<ApiResponse<ICheckFaceResponse>> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await apiClient.post<ApiResponse<ICheckFaceResponse>>(
      '/api/v1/employee/face-recognition/check-face',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  },

  enrollFace: async (imageFiles: File[]): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/employee/face-recognition/enroll-face',
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

export * from '@/types/faceRecognition';
