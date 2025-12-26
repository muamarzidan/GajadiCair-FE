import apiClient from '@/lib/apiClient';
import type {
  PayrollAllowanceRule,
  CreateAllowanceRuleRequest,
  UpdateAllowanceRuleRequest,
  PayrollDeductionRule,
  CreateDeductionRuleRequest,
  UpdateDeductionRuleRequest,
  PayrollSummaryEmployee,
} from '@/types/payroll';
import type { ApiResponse } from '@/types/api';

// Allowance Rules API
export const allowanceRulesApi = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<PayrollAllowanceRule[]>>(
      '/api/v1/company/payroll/allowance-rules'
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<PayrollAllowanceRule>>(
      `/api/v1/company/payroll/allowance-rules/${id}`
    );
    return response.data;
  },

  create: async (data: CreateAllowanceRuleRequest) => {
    const response = await apiClient.post<ApiResponse<PayrollAllowanceRule>>(
      '/api/v1/company/payroll/allowance-rules',
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateAllowanceRuleRequest) => {
    const response = await apiClient.patch<ApiResponse<PayrollAllowanceRule>>(
      `/api/v1/company/payroll/allowance-rules/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/v1/company/payroll/allowance-rules/${id}`
    );
    return response.data;
  },
};

// Deduction Rules API
export const deductionRulesApi = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<PayrollDeductionRule[]>>(
      '/api/v1/company/payroll/deduction-rules'
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<PayrollDeductionRule>>(
      `/api/v1/company/payroll/deduction-rules/${id}`
    );
    return response.data;
  },

  create: async (data: CreateDeductionRuleRequest) => {
    const response = await apiClient.post<ApiResponse<PayrollDeductionRule>>(
      '/api/v1/company/payroll/deduction-rules',
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateDeductionRuleRequest) => {
    const response = await apiClient.patch<ApiResponse<PayrollDeductionRule>>(
      `/api/v1/company/payroll/deduction-rules/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/v1/company/payroll/deduction-rules/${id}`
    );
    return response.data;
  },
};

// Payroll Summary API
export const payrollSummaryApi = {
  getSummary: async () => {
    const response = await apiClient.get<ApiResponse<PayrollSummaryEmployee[]>>(
      '/api/v1/company/payroll/summary'
    );
    return response.data;
  },
};
