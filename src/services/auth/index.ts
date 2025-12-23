import apiClient from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { 
  User, 
  CompanyUser,
  EmployeeUser,
  CompanyLoginRequest, 
  EmployeeLoginRequest,
  RegisterRequest, 
  GoogleLoginRequest,
  CompanyLoginResponse,
  EmployeeLoginResponse,
} from '@/types/auth';


export const authApi = {
  loginAsCompany: async (data: CompanyLoginRequest): Promise<ApiResponse<CompanyUser>> => {
    const response = await apiClient.post<ApiResponse<CompanyLoginResponse>>(
      '/api/v1/auth/company/login', 
      data
    );
    
    const { access_token, company } = response.data.data;
    
    if (access_token) {
      localStorage.setItem('access_token-gjdc', access_token);
      localStorage.setItem('company_credentials-gjdc', JSON.stringify({
        email: data.email,
        password: data.password,
      }));
    } else {
      throw new Error('No access token received from server');
    }
    
    return {
      ...response.data,
      data: { ...company, role: 'company' as const } as CompanyUser,
    };
  },
  
  loginAsEmployee: async (data: EmployeeLoginRequest): Promise<ApiResponse<EmployeeUser>> => {
    const response = await apiClient.post<ApiResponse<EmployeeLoginResponse>>(
      '/api/v1/auth/employee/login', 
      data
    );
    
    const { access_token, employee } = response.data.data;
    
    if (access_token) {
      localStorage.setItem('access_token-gjdc', access_token);
      localStorage.setItem('employee_credentials-gjdc', JSON.stringify({
        username: data.username,
        company_identifier: data.company_identifier,
        password: data.password,
      }));
    } else {
      throw new Error('No access token received from server');
    }
    
    return {
      ...response.data,
      data: { ...employee, role: 'employee' as const } as EmployeeUser,
    };
  },
  
  register: async (data: RegisterRequest): Promise<ApiResponse<CompanyUser>> => {
    const response = await apiClient.post<ApiResponse<CompanyLoginResponse>>(
      '/api/v1/auth/company/register', 
      data
    );
    
    const { access_token, company } = response.data.data;
    
    if (access_token) {
      localStorage.setItem('access_token-gjdc', access_token);
      localStorage.setItem('company_credentials-gjdc', JSON.stringify({
        email: data.email,
        password: data.password,
      }));
    } else {
      throw new Error('No access token received from server');
    }
    
    return {
      ...response.data,
      data: { ...company, role: 'company' as const } as CompanyUser,
    };
  },
  
  loginWithGoogle: async (data: GoogleLoginRequest): Promise<ApiResponse<CompanyUser>> => {
    const response = await apiClient.post<ApiResponse<CompanyLoginResponse>>(
      '/api/v1/auth/company/login/google', 
      data
    );
    
    const { access_token, company } = response.data.data;
    
    if (access_token) {
      localStorage.setItem('access_token-gjdc', access_token);
      // Google login doesn't have password, so we don't store credentials
    } else {
      throw new Error('No access token received from server');
    }
    
    return {
      ...response.data,
      data: { ...company, role: 'company' as const } as CompanyUser,
    };
  },
  
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/v1/auth/company/logout');
    localStorage.removeItem('access_token-gjdc');
    localStorage.removeItem('company_credentials-gjdc');
    return response.data;
  },

  logoutEmployee: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/api/v1/auth/employee/logout');
    localStorage.removeItem('access_token-gjdc');
    localStorage.removeItem('employee_credentials-gjdc');
    return response.data;
  },

  // Refresh access token using refresh_token cookie
  // Dynamically detects role from current token to use correct endpoint
  refreshToken: async (): Promise<string> => {
    const currentToken = localStorage.getItem('access_token-gjdc');
    let endpoint = '/api/v1/auth/company/refresh-token';
    let credentials: any = null;
    
    if (currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        
        if (payload.role === 'employee') {
          endpoint = '/api/v1/auth/employee/refresh-token';
          const storedCreds = localStorage.getItem('employee_credentials-gjdc');
          if (storedCreds) {
            credentials = JSON.parse(storedCreds);
          }
        } else {
          const storedCreds = localStorage.getItem('company_credentials-gjdc');
          if (storedCreds) {
            credentials = JSON.parse(storedCreds);
          }
        }
      } catch (e) {
        // Token decode failed, use default company endpoint
      }
    }
    
    if (!credentials) {
      throw new Error('No credentials available for token refresh');
    }
    
    const response = await apiClient.post<ApiResponse<{ access_token: string }>>(
      endpoint,
      credentials
    );
    
    const { access_token } = response.data.data;
    
    if (access_token) {
      localStorage.setItem('access_token-gjdc', access_token);
      return access_token;
    }
    
    throw new Error('Failed to refresh token');
  },
  
  getCompanyProfile: async (): Promise<ApiResponse<CompanyUser>> => {
    const response = await apiClient.get('/api/v1/auth/company/profile');
    return response.data;
  },
  
  getEmployeeProfile: async (): Promise<ApiResponse<EmployeeUser>> => {
    const response = await apiClient.get('/api/v1/auth/employee/profile');
    return response.data;
  },
};

export * from '@/types/auth';