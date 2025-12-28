import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { authApi } from '@/services/auth';
import { getErrorMessage } from '@/utils';
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
  loginAsCompany: (data: CompanyLoginRequest) => Promise<User>;
  loginAsEmployee: (data: EmployeeLoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  loginWithGoogle: (data: GoogleLoginRequest) => Promise<User>;
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
    const accessToken = localStorage.getItem('access_token-gjdc');
    
    try {
      setIsLoading(true);
      
      if (!accessToken) {
        setUser(null);
        return;
      };
      
      // Decode token to get role and basic info
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userRole: 'company' | 'employee' = payload.role || 'company';
      
      // Fetch profile based on role
      const profileResponse = userRole === 'employee' 
        ? await authApi.getEmployeeProfile()
        : await authApi.getCompanyProfile();
      
      if (profileResponse.statusCode === 200) {
        const userData = { ...profileResponse.data, role: userRole };
        setUser(userData as User);
      } else if (profileResponse.statusCode === 401 || profileResponse.statusCode === 403) {
        // Only clear on auth errors (401/403)
        throw new Error('Invalid session');
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      
      // Only clear on auth errors (401/403), not network errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('access_token-gjdc');
        localStorage.removeItem('company_credentials-gjdc');
        localStorage.removeItem('employee_credentials-gjdc');
        setUser(null);
      } else if (accessToken) {
        // On network errors, try to keep user logged in with token data
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const userRole: 'company' | 'employee' = payload.role || 'company';
          
          // Set minimal user data from token to keep user logged in
          setUser({
            role: userRole,
            name: payload.name || 'User',
            email: payload.email || '',
            username: payload.username || '',
          } as User);
          
          console.warn('Using token data due to network error. Will retry on next navigation.');
        } catch (tokenError) {
          // If token is invalid/corrupted, clear everything
          localStorage.removeItem('access_token-gjdc');
          localStorage.removeItem('company_credentials-gjdc');
          localStorage.removeItem('employee_credentials-gjdc');
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    };
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginAsCompany = async (data: CompanyLoginRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authApi.loginAsCompany(data);
      
      if (response.statusCode === 200 && response.data) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Company login failed'));
    } finally {
      setIsLoading(false);
    }
  };
  const loginAsEmployee = async (data: EmployeeLoginRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authApi.loginAsEmployee(data);
      
      if (response.statusCode === 200 && response.data) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Employee login failed'));
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (data: RegisterRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      if (response.statusCode === 201 || response.statusCode === 200) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Registration failed'));
    } finally {
      setIsLoading(false);
    };
  };
  const loginWithGoogle = async (data: GoogleLoginRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authApi.loginWithGoogle(data);
      
      if (response.statusCode === 200) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Google login failed'));
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