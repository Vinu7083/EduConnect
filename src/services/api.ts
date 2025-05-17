import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string = 'http://localhost:5000/api';
  
  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle network errors
        if (!error.response) {
          console.error('Network error: Could not connect to the server');
          return Promise.reject(new Error('Network error: Could not connect to the server'));
        }
        
        // Handle API errors
        const { status, data } = error.response;
        
        if (status === 401) {
          // Handle unauthorized (clear token & redirect to login)
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        const errorMessage = data?.message || 'Something went wrong';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }
  
  setToken(token: string): void {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  
  removeToken(): void {
    delete this.client.defaults.headers.common.Authorization;
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
  
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const api = new ApiService();