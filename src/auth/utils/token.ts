/**
 * Token utilities for authentication
 */
import { AuthProvider } from '../types/auth';

const TOKEN_KEY = 'buildease_auth_token';

/**
 * Store JWT token in local storage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieve JWT token from local storage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove JWT token from local storage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get authorization header with token
 */
export function getAuthHeader(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Store provider-specific token
 */
export function setProviderToken(provider: AuthProvider, token: string): void {
  localStorage.setItem(`${provider}_token`, token);
}

/**
 * Get provider-specific token
 */
export function getProviderToken(provider: AuthProvider): string | null {
  return localStorage.getItem(`${provider}_token`);
}

/**
 * Remove provider-specific token
 */
export function removeProviderToken(provider: AuthProvider): void {
  localStorage.removeItem(`${provider}_token`);
}

/**
 * Get all active authentication providers
 */
export function getActiveProviders(): AuthProvider[] {
  const providers: AuthProvider[] = [];
  const allProviders: AuthProvider[] = ['email', 'google', 'facebook', 'apple'];
  
  allProviders.forEach(provider => {
    if (provider === 'email' && getStoredToken()) {
      providers.push(provider);
    } else if (getProviderToken(provider)) {
      providers.push(provider);
    }
  });
  
  return providers;
} 