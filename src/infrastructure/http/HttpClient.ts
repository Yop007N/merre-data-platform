import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { environment } from '../config/environment';

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface HttpError {
  message: string;
  status?: number;
  code?: string;
  data?: any;
}

export class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || environment.api.baseUrl,
      timeout: environment.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (!environment.production) {
          console.log(`HTTP ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (!environment.production) {
          console.log(`HTTP ${response.status} ${response.config.url}`, response.data);
        }

        return response;
      },
      (error) => {
        const httpError: HttpError = {
          message: error.message || 'Network error occurred',
          status: error.response?.status,
          code: error.code,
          data: error.response?.data,
        };

        // Log error
        console.error('HTTP Error:', httpError);

        // Handle specific error cases
        if (httpError.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          this.handleUnauthorized();
        }

        return Promise.reject(httpError);
      }
    );
  }

  private getAuthToken(): string | null {
    // This should be implemented based on your auth strategy
    // For now, we'll get it from localStorage
    return localStorage.getItem('authToken');
  }

  private handleUnauthorized(): void {
    // Clear auth token
    localStorage.removeItem('authToken');

    // Redirect to login if not already there
    if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
      window.location.href = '/';
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): HttpError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.message || 'Server error',
        status: error.response.status,
        code: error.response.data?.code,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - no response received',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

// Export singleton instance
export const httpClient = new HttpClient();