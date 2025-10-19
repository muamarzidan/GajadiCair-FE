import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.MODE === 'development' 
  ? import.meta.env.VITE_DEV_API_URL 
  : import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for cookie-based auth
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      Cookies.remove('refresh_token');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;