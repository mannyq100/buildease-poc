/**
 * Auth Service
 * Provides methods for authentication and user management
 */
import apiClient from '@/lib/api-client'
import { createService } from './serviceFactory'
import * as mockAuthService from '@/data/mock/services/authService'

// Define interfaces for the auth service
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
}

// Real API implementation
const realAuthService = {
  /**
   * Log in a user with credentials
   * @param credentials Login credentials (email, password)
   * @returns Promise that resolves to login response with user data and tokens
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    
    // Store the authentication token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    
    return response
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise that resolves to the registered user
   */
  register: async (userData: RegisterUserData): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', userData)
    return response
  },

  /**
   * Log out the current user
   * @returns Promise that resolves when logout is complete
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      // Always remove tokens, even if the API call fails
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    }
  },

  /**
   * Get the current logged-in user
   * @returns Promise that resolves to the current user or null if not logged in
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorWithResponse = error as { response?: { status?: number } };
        if (errorWithResponse.response?.status === 401) {
          return null;
        }
      }
      throw error
    }
  },

  /**
   * Request a password reset link
   * @param request Password reset request with email
   * @returns Promise that resolves to success message
   */
  requestPasswordReset: async (request: PasswordResetRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', request)
    return response
  },

  /**
   * Update user password
   * @param passwordData Old and new password
   * @returns Promise that resolves to success message
   */
  updatePassword: async (passwordData: PasswordUpdateData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/update-password', passwordData)
    return response
  },

  /**
   * Verify if a user is authenticated (has valid token)
   * @returns Promise that resolves to boolean indicating if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/verify')
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Refresh the authentication token using the refresh token
   * @returns Promise that resolves to new tokens
   */
  refreshToken: async (): Promise<{ token: string; refreshToken: string }> => {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await apiClient.post<{ token: string; refreshToken: string }>(
      '/auth/refresh', 
      { refreshToken }
    )
    
    // Store the new tokens
    localStorage.setItem('authToken', response.token)
    localStorage.setItem('refreshToken', response.refreshToken)
    
    return response
  }
}

// Export the appropriate implementation based on configuration
export const {
  login,
  register,
  logout,
  getCurrentUser,
  requestPasswordReset,
  updatePassword,
  isAuthenticated,
  refreshToken
} = createService<typeof realAuthService>(
  'auth',
  mockAuthService,
  realAuthService
)

// Export types for use in other components
export type { User, LoginCredentials, LoginResponse, RegisterUserData, PasswordResetRequest, PasswordUpdateData }
