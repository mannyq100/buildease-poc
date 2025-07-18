/**
 * Service Factory
 * Creates service implementations based on configuration
 * Allows toggling between mock and real API implementations
 */
import { USE_MOCK_API, DEFAULT_TO_MOCK } from '@/config';
import { AxiosRequestConfig } from 'axios';

interface ApiClient {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

/**
 * Creates a service implementation based on configuration
 * @param entityName The name of the entity/feature (e.g., 'team', 'projects')
 * @param mockImplementation The mock implementation of the service
 * @param realImplementation The real API implementation of the service
 * @returns The appropriate service implementation based on configuration
 */
export function createService<T>(
  entityName: string,
  mockImplementation: T,
  realImplementation: T
): T {
  // Check if there's a specific flag for this entity, otherwise use the default
  const useMock = USE_MOCK_API[entityName] ?? DEFAULT_TO_MOCK;
  
  return useMock ? mockImplementation : realImplementation;
}

/**
 * Helper for mapping simple methods to their API equivalents
 * @param mockMethod The mock method implementation
 * @param entityName The entity name for feature flag checking
 * @param apiEndpoint The API endpoint to call if using real implementation
 * @param apiClient The API client instance
 * @returns A function that will call either mock or real implementation
 */
export function createMethod<TArgs extends unknown[], TReturn>(
  mockMethod: (...args: TArgs) => Promise<TReturn>,
  entityName: string,
  apiEndpoint: string | ((...args: TArgs) => string),
  apiMethod: 'get' | 'post' | 'put' | 'delete' | 'patch',
  apiClient: ApiClient,
  dataTransformer?: (data: unknown) => TReturn
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    // Check if we should use the mock implementation
    if (USE_MOCK_API[entityName] ?? DEFAULT_TO_MOCK) {
      return mockMethod(...args);
    }
    
    // If not, call the real API
    try {
      const endpoint = typeof apiEndpoint === 'function' 
        ? apiEndpoint(...args) 
        : apiEndpoint;
        
      let response;
      
      // Handle different HTTP methods
      if (apiMethod === 'get' || apiMethod === 'delete') {
        response = await apiClient[apiMethod](endpoint);
      } else {
        // For post, put, patch we need to send the first argument as data
        response = await apiClient[apiMethod](endpoint, args[0]);
      }
      
      // Transform the response if a transformer was provided
      return dataTransformer ? dataTransformer(response) : (response as TReturn);
    } catch (error) {
      console.error(`API error for ${entityName}:`, error);
      throw error;
    }
  };
}
