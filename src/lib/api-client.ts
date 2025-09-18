/**
 * API Client
 * Centralized HTTP client for making API requests with Supabase authentication support
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/lib/supabase';
import { AuthProvider } from '@/types/user';
import { API_CONFIG } from '@/config';

// API URL fallback if not specified in config
const API_URL = API_CONFIG.baseUrl || import.meta.env.VITE_API_URL || (import.meta.env.VITE_SUPABASE_URL + '/rest/v1');

// Create axios instance with default config
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.timeout || 30000,
  withCredentials: API_CONFIG.withCredentials || false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding Supabase auth token
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('Failed to get Supabase session for API request:', error);
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    if (error.response) {
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401: // Unauthorized
          // Sign out from Supabase and redirect to login
          supabase.auth.signOut().catch(console.error);
          window.location.href = '/login?session=expired';
          break;
          
        case 403: // Forbidden
          console.error('Permission denied:', error.response.data);
          break;
          
        case 404: // Not found
          console.error('Resource not found:', error.response.data);
          break;
          
        case 500: // Server error
        case 502: // Bad gateway
        case 503: // Service unavailable
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error(`Error ${error.response.status}:`, error.response.data);
          break;
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network error, no response received:', error.request);
    } else {
      // Error setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Request options interface for backward compatibility
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  includeAuth?: boolean;
  provider?: AuthProvider;
  config?: AxiosRequestConfig;
}

/**
 * Make API request with authentication support
 * @deprecated Use the apiClient default export methods instead
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    includeAuth = true,
    provider,
    config = {}
  } = options;

  console.log(`🌐 Using API for ${method} ${endpoint} at ${API_URL}`);

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...headers
  };

  // Add auth header if needed
  if (includeAuth) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        requestHeaders.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('Failed to get Supabase session for API request:', error);
    }
  }

  // Add provider-specific token if specified
  if (provider) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // For OAuth providers, we can get provider tokens from session
      if (session?.provider_token) {
        requestHeaders[`X-${provider.toUpperCase()}-TOKEN`] = session.provider_token;
      }
    } catch (error) {
      console.warn('Failed to get provider token from Supabase session:', error);
    }
  }

  // Use axios client with built headers
  try {
    const response = await axiosClient.request<T>({
      method,
      url: endpoint,
      data: body,
      headers: requestHeaders,
      ...config
    });
    
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    if (error instanceof Error) {
      console.error('apiRequest Catch details:', { name: error.name, message: error.message, stack: error.stack });
    } else {
      console.error('apiRequest caught non-Error:', error);
    }
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Generic request method with type safety
 */
async function request<T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * HTTP methods with type safety
 */
const apiClient = {
  /**
   * Make a GET request
   * @param url The endpoint URL
   * @param config Optional axios config
   */
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    request<T>('GET', url, undefined, config),
    
  /**
   * Make a POST request
   * @param url The endpoint URL
   * @param data The request body
   * @param config Optional axios config
   */
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    request<T>('POST', url, data, config),
    
  /**
   * Make a PUT request
   * @param url The endpoint URL
   * @param data The request body
   * @param config Optional axios config
   */
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    request<T>('PUT', url, data, config),
    
  /**
   * Make a PATCH request
   * @param url The endpoint URL
   * @param data The request body
   * @param config Optional axios config
   */
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    request<T>('PATCH', url, data, config),
    
  /**
   * Make a DELETE request
   * @param url The endpoint URL
   * @param config Optional axios config
   */
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    request<T>('DELETE', url, undefined, config),
  
  /**
   * The base URL being used for API requests
   */
  baseURL: API_URL,

  /**
   * Add a provider token to the request
   * @param provider The auth provider
   * @param config The axios config to modify
   */
  addProviderToken: async (provider: AuthProvider, config: AxiosRequestConfig = {}): Promise<AxiosRequestConfig> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        if (!config.headers) config.headers = {};
        config.headers[`X-${provider.toUpperCase()}-TOKEN`] = session.provider_token;
      }
    } catch (error) {
      console.warn('Failed to get provider token from Supabase session:', error);
    }
    return config;
  }
};

export default apiClient;