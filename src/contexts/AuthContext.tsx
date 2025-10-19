import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/services/auth';
import type { User, LoginRequest, RegisterRequest, GoogleLoginRequest } from '@/services/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

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
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      const cookieString = document.cookie;
      const hasRefreshToken = cookieString.includes('refresh_token');
      const hasAuthCookie = hasRefreshToken;
      const storedUser = localStorage.getItem('gajadicair_user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else if (hasAuthCookie) {
        setUser({
          id: 'authenticated-user',
          email: 'user@authenticated.com',
          name: 'Authenticated User',
          avatar_uri: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
      } else {
        setUser(null);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Auth check failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      
      if (response.statusCode === 200) {
        setUser(response.data);
        
        // IMPORTANT: Save user to localStorage as fallback since cookies might not work
        localStorage.setItem('gajadicair_user', JSON.stringify(response.data));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
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
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
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
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    } finally {
      setUser(null);
      Cookies.remove('refresh_token');
      localStorage.removeItem('gajadicair_user');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};