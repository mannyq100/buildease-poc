/**
 * API client for making authenticated requests
 */
import { getAuthHeader, removeToken, getProviderToken } from '@/auth/utils/token';
import { AuthProvider } from '@/auth/types/auth';

// For development/testing - check the environment variable
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true' || process.env.NODE_ENV === 'development';

console.log('API Client initialized with:', { 
  mockEnabled: USE_MOCK_API,
  apiUrl: import.meta.env.VITE_API_URL,
  mockEnvVar: import.meta.env.VITE_USE_MOCK
});

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  includeAuth?: boolean;
  mockDelay?: number;
  provider?: AuthProvider;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    mockDelay = 800,
    provider
  } = options;

  // For testing with mock data
  if (USE_MOCK_API) {
    console.log(`📦 Using MOCK data for ${method} ${endpoint}`);
    return mockApiRequest<T>(endpoint, { method, body, mockDelay });
  }

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
      throw new Error(
        typeof data === 'object' && data.message
          ? data.message
          : 'API request failed'
      );
    }

    return data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Mock API for development/testing
 */
async function mockApiRequest<T>(
  endpoint: string,
  options: { method: string; body?: any; mockDelay: number }
): Promise<T> {
  const { method, body, mockDelay } = options;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, mockDelay));

  // Handle based on endpoint
  if (endpoint === '/auth/login' && method === 'POST') {
    // Mock login response
    const mockResponse = {
      user: {
        id: '1',
        email: body.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'owner',
        company: 'Doe Construction',
        avatar: '/avatars/john-doe.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'mock-jwt-token'
    };
    
    // Simulate failed login for wrong credentials
    if (body.email !== 'john.doe@example.com' || body.password !== 'password') {
      throw new Error('Invalid email or password');
    }
    
    return mockResponse as unknown as T;
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    // Mock register response
    const mockResponse = {
      user: {
        id: '2',
        ...body,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'mock-jwt-token'
    };
    
    return mockResponse as unknown as T;
  }

  if (endpoint === '/auth/social/callback' && method === 'POST') {
    // Mock social login response
    const { provider, code } = body;
    
    const mockResponse = {
      user: {
        id: '3',
        email: `user@${provider}.com`,
        firstName: 'Social',
        lastName: 'User',
        role: 'owner',
        avatar: `/avatars/${provider}-user.jpg`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        socialProfiles: {
          [provider]: {
            id: `${provider}-123`,
            email: `user@${provider}.com`,
            name: 'Social User'
          }
        }
      },
      token: `mock-jwt-token-${provider}`,
      providerToken: `mock-provider-token-${provider}`
    };
    
    return mockResponse as unknown as T;
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    // Mock user data response
    const mockResponse = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'owner',
      company: 'Doe Construction',
      avatar: '/avatars/john-doe.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return mockResponse as unknown as T;
  }

  // Default response for unhandled endpoints
  throw new Error(`Unhandled mock endpoint: ${method} ${endpoint}`);
} 