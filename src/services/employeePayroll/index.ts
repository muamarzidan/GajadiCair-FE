import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  EmployeePayrollSummary,
  PayrollLog,
  PayrollLogDetail,
} from '@/types/employeePayroll';

// Employee Payroll API
export const employeePayrollApi = {
  getSummary: async () => {
    const response = await apiClient.get<ApiResponse<EmployeePayrollSummary>>(
      '/api/v1/employee/payroll/summary'
    );
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get<ApiResponse<PayrollLog[]>>(
      '/api/v1/employee/payroll/history'
    );
    return response.data;
  },

  getHistoryById: async (payrollLogId: string) => {
    const response = await apiClient.get<ApiResponse<PayrollLogDetail>>(
      `/api/v1/employee/payroll/history/${payrollLogId}`
    );
    return response.data;
  },
};
