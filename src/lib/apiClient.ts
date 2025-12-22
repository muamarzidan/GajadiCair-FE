import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';


const baseURL = import.meta.env.MODE === 'development' 
  ? import.meta.env.VITE_DEV_API_URL
  : import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token-gjdc');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    };
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (originalRequest.url?.includes('/auth/company/login') || 
          originalRequest.url?.includes('/auth/employee/login') ||
          originalRequest.url?.includes('/auth/company/register') ||
          originalRequest.url?.includes('/auth/company/refresh-token') ||
          originalRequest.url?.includes('/auth/employee/refresh-token')) {
        localStorage.removeItem('access_token-gjdc');
        return Promise.reject(error);
      };

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      };

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { authApi } = await import('@/services/auth');
        const newAccessToken = await authApi.refreshToken();
        
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token-gjdc');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      };
    };
    
    return Promise.reject(error);
  }
);

export default apiClient;