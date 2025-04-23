/**
 * API client for making authenticated requests
 */
import { getAuthHeader, removeToken, getProviderToken } from '@/lib/token';
import { AuthProvider } from '@/types/user';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  includeAuth?: boolean;
  provider?: AuthProvider;
}

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '/api');

/**
 * Make API request with authentication support
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
    provider
  } = options;

  console.log(`🌐 Using REAL API for ${method} ${endpoint} at ${API_URL}`);

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add auth header if needed
  if (includeAuth) {
    const authHeader = getAuthHeader();
    Object.assign(requestHeaders, authHeader);
  }

  // Add provider-specific token if specified
  if (provider) {
    const providerToken = getProviderToken(provider);
    if (providerToken) {
      requestHeaders[`X-${provider.toUpperCase()}-TOKEN`] = providerToken;
    }
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

    // Handle authentication errors
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login?session=expired';
      throw new Error('Authentication failed');
    }

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error(`API Error: Status ${response.status} ${response.statusText} for ${method} ${endpoint}`);
      console.error('API Error Data:', data);
      throw new Error(
        typeof data === 'object' && data.message
          ? data.message
          : 'API request failed'
      );
    }

    return data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    // Log specific error details
    if (error instanceof Error) {
      console.error('apiRequest Catch details:', { name: error.name, message: error.message, stack: error.stack });
    } else {
      console.error('apiRequest caught non-Error:', error);
    }
    throw error; // Re-throw the error to be handled by the caller
  }
}