import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { 
    AttendanceSummaryResponse, 
    UpdateAttendanceRequest 
} from '@/types/attendanceSummary';

export const attendanceSummaryApi = {
    getSummary: async (
        startDate?: string, 
        endDate?: string
    ): Promise<ApiResponse<AttendanceSummaryResponse>> => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const url = `/api/v1/company/attendance/summary${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    updateAttendance: async (
        data: UpdateAttendanceRequest
    ): Promise<ApiResponse<unknown>> => {
        const response = await apiClient.patch('/api/v1/company/attendance', data);
        return response.data;
    },
};

export * from '@/types/attendanceSummary';
