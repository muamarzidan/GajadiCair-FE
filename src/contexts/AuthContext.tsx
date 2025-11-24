import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { authApi } from '@/services/auth';
import type { 
  User, 
  CompanyLoginRequest, 
  EmployeeLoginRequest,
  RegisterRequest, 
  GoogleLoginRequest
} from '@/services/auth';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: 'company' | 'employee' | null;
  loginAsCompany: (data: CompanyLoginRequest) => Promise<void>;
  loginAsEmployee: (data: EmployeeLoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
interface AuthProviderProps {
  children: ReactNode;
};
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;
  const userRole = user?.role || null;

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      const accessToken = localStorage.getItem('access_token-gjdc');
      if (!accessToken) {
        setUser(null);
        return;
      };
      
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userRole: 'company' | 'employee' = payload.role || 'company';
      
      // Fetch profile based on role
      const profileResponse = userRole === 'employee' 
        ? await authApi.getEmployeeProfile()
        : await authApi.getCompanyProfile();
      
      if (profileResponse.statusCode === 200) {
        const userData = { ...profileResponse.data, role: userRole };
        setUser(userData as User);
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      localStorage.removeItem('access_token-gjdc');
      localStorage.removeItem('company_credentials-gjdc');
      localStorage.removeItem('employee_credentials-gjdc');
      setUser(null);
    } finally {
      setIsLoading(false);
    };
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginAsCompany = async (data: CompanyLoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.loginAsCompany(data);
      
      if (response.statusCode === 200 && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.message || 'Login failed');
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Company login failed');
    } finally {
      setIsLoading(false);
    };
  };
  const loginAsEmployee = async (data: EmployeeLoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.loginAsEmployee(data);
      
      if (response.statusCode === 200 && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Employee login failed');
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      if (response.statusCode === 201 || response.statusCode === 200) {
        setUser(response.data);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    };
  };
  const loginWithGoogle = async (data: GoogleLoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.loginWithGoogle(data);
      
      if (response.statusCode === 200) {
        setUser(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    };
  };
  const logout = async () => {
    try {
      if (user?.role === 'employee') {
        await authApi.logoutEmployee();
      } else {
        await authApi.logout();
      };
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token-gjdc');
      localStorage.removeItem('company_credentials-gjdc');
      localStorage.removeItem('employee_credentials-gjdc');
      setUser(null);
      window.location.href = '/';
    };
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    userRole,
    loginAsCompany,
    loginAsEmployee,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};