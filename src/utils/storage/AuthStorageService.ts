/**
 * Auth Storage Service
 * 
 * Unified service for all authentication-related storage operations
 * Provides consistent API with proper expiration and cleanup
 */

import { storageManager } from './StorageManager';
import { STORAGE_KEYS, STORAGE_CONFIG } from './constants';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  role?: string;
  settings?: Record<string, unknown>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface ProviderTokens {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
}

export interface SessionData {
  userId: string;
  isAuthenticated: boolean;
  lastActivity: number;
  sessionId: string;
}

export interface AuthStorageInterface {
  // Token management
  setAuthTokens(tokens: AuthTokens): Promise<void>;
  getAuthTokens(): Promise<AuthTokens | null>;
  clearAuthTokens(): Promise<void>;
  
  // Provider token management
  setProviderTokens(provider: string, tokens: ProviderTokens): Promise<void>;
  getProviderTokens(provider: string): Promise<ProviderTokens | null>;
  clearProviderTokens(provider: string): Promise<void>;
  
  // User profile caching
  setUserProfile(userId: string, profile: UserProfile): Promise<void>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  clearUserProfile(userId: string): Promise<void>;
  
  // Session management
  setSessionData(sessionData: SessionData): Promise<void>;
  getSessionData(): Promise<SessionData | null>;
  clearSessionData(): Promise<void>;
  
  // Navigation state
  setReturnUrl(url: string): Promise<void>;
  getReturnUrl(): Promise<string | null>;
  clearReturnUrl(): Promise<void>;
  
  // Cleanup operations
  clearAllAuthData(): Promise<void>;
  isTokenExpired(tokens: AuthTokens): boolean;
  refreshProfileCache(userId: string): Promise<void>;
}

export class AuthStorageService implements AuthStorageInterface {
  
  /**
   * Set authentication tokens with automatic expiration
   */
  async setAuthTokens(tokens: AuthTokens): Promise<void> {
    const expiresIn = tokens.expiresAt 
      ? tokens.expiresAt - Date.now()
      : 24 * 60 * 60 * 1000; // Default 24 hours

    await storageManager.set(STORAGE_KEYS.AUTH.TOKEN, tokens.accessToken, {
      expiresIn: Math.max(0, expiresIn)
    });
    
    if (tokens.refreshToken) {
      await storageManager.set(STORAGE_KEYS.AUTH.REFRESH_TOKEN, tokens.refreshToken, {
        expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 days for refresh token
      });
    }
  }

  /**
   * Get authentication tokens
   */
  async getAuthTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      storageManager.get<string>(STORAGE_KEYS.AUTH.TOKEN),
      storageManager.get<string>(STORAGE_KEYS.AUTH.REFRESH_TOKEN)
    ]);

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      tokenType: 'Bearer'
    };
  }

  /**
   * Clear authentication tokens
   */
  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      storageManager.remove(STORAGE_KEYS.AUTH.TOKEN),
      storageManager.remove(STORAGE_KEYS.AUTH.REFRESH_TOKEN)
    ]);
  }

  /**
   * Set provider-specific tokens
   */
  async setProviderTokens(provider: string, tokens: ProviderTokens): Promise<void> {
    const key = `buildease_${provider.toLowerCase()}_token`;
    const expiresIn = tokens.expiresAt 
      ? tokens.expiresAt - Date.now()
      : 24 * 60 * 60 * 1000; // Default 24 hours

    await storageManager.set(key, tokens, {
      expiresIn: Math.max(0, expiresIn)
    });
  }

  /**
   * Get provider-specific tokens
   */
  async getProviderTokens(provider: string): Promise<ProviderTokens | null> {
    const key = `buildease_${provider.toLowerCase()}_token`;
    return await storageManager.get<ProviderTokens>(key);
  }

  /**
   * Clear provider-specific tokens
   */
  async clearProviderTokens(provider: string): Promise<void> {
    const key = `buildease_${provider.toLowerCase()}_token`;
    await storageManager.remove(key);
  }

  /**
   * Set user profile with automatic cache expiration
   */
  async setUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const cacheKey = STORAGE_KEYS.AUTH.PROFILE_CACHE(userId);
    
    await storageManager.set(cacheKey, {
      ...profile,
      cached_at: Date.now()
    }, {
      expiresIn: STORAGE_CONFIG.CACHE_EXPIRY.USER_PROFILE
    });
  }

  /**
   * Get cached user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const cacheKey = STORAGE_KEYS.AUTH.PROFILE_CACHE(userId);
    const cached = await storageManager.get<UserProfile & { cached_at: number }>(cacheKey);
    
    if (!cached) {
      return null;
    }

    // Remove cache metadata before returning
    const { cached_at, ...profile } = cached;
    return profile;
  }

  /**
   * Clear user profile cache
   */
  async clearUserProfile(userId: string): Promise<void> {
    const cacheKey = STORAGE_KEYS.AUTH.PROFILE_CACHE(userId);
    await storageManager.remove(cacheKey);
  }

  /**
   * Set session data
   */
  async setSessionData(sessionData: SessionData): Promise<void> {
    await storageManager.set(STORAGE_KEYS.USER.SESSION, sessionData, {
      expiresIn: STORAGE_CONFIG.CACHE_EXPIRY.SESSION_DATA
    });
  }

  /**
   * Get session data
   */
  async getSessionData(): Promise<SessionData | null> {
    return await storageManager.get<SessionData>(STORAGE_KEYS.USER.SESSION);
  }

  /**
   * Clear session data
   */
  async clearSessionData(): Promise<void> {
    await storageManager.remove(STORAGE_KEYS.USER.SESSION);
  }

  /**
   * Set return URL for post-auth navigation
   */
  async setReturnUrl(url: string): Promise<void> {
    await storageManager.set(STORAGE_KEYS.NAVIGATION.RETURN_URL, url, {
      expiresIn: 30 * 60 * 1000 // 30 minutes
    });
  }

  /**
   * Get return URL
   */
  async getReturnUrl(): Promise<string | null> {
    return await storageManager.get<string>(STORAGE_KEYS.NAVIGATION.RETURN_URL);
  }

  /**
   * Clear return URL
   */
  async clearReturnUrl(): Promise<void> {
    await storageManager.remove(STORAGE_KEYS.NAVIGATION.RETURN_URL);
  }

  /**
   * Clear all authentication-related data
   */
  async clearAllAuthData(): Promise<void> {
    const authKeys = [
      STORAGE_KEYS.AUTH.TOKEN,
      STORAGE_KEYS.AUTH.REFRESH_TOKEN,
      STORAGE_KEYS.USER.SESSION,
      STORAGE_KEYS.NAVIGATION.RETURN_URL
    ];

    // Clear provider tokens
    const providers = ['google', 'facebook', 'apple', 'github'];
    const providerKeys = providers.map(provider => `buildease_${provider}_token`);

    // Clear all auth-related keys
    await Promise.all([
      ...authKeys.map(key => storageManager.remove(key)),
      ...providerKeys.map(key => storageManager.remove(key))
    ]);

    // Note: User profile cache is preserved as it may be useful for offline scenarios
    // It will expire naturally based on cache settings
  }

  /**
   * Check if tokens are expired
   */
  isTokenExpired(tokens: AuthTokens): boolean {
    if (!tokens.expiresAt) {
      return false; // No expiration set
    }
    
    // Add 5-minute buffer for clock skew
    const buffer = 5 * 60 * 1000;
    return Date.now() >= (tokens.expiresAt - buffer);
  }

  /**
   * Force refresh of profile cache
   */
  async refreshProfileCache(userId: string): Promise<void> {
    await this.clearUserProfile(userId);
  }

  /**
   * Migration helpers for legacy storage
   */
  async migrateLegacyAuth(): Promise<void> {
    // Migrate from legacy keys to new unified keys
    const legacyMappings = [
      { legacy: 'authToken', new: STORAGE_KEYS.AUTH.TOKEN },
      { legacy: 'refreshToken', new: STORAGE_KEYS.AUTH.REFRESH_TOKEN },
      { legacy: 'theme', new: STORAGE_KEYS.THEME },
      { legacy: 'userName', new: STORAGE_KEYS.USER.NAME },
      { legacy: 'returnUrl', new: STORAGE_KEYS.NAVIGATION.RETURN_URL }
    ];

    for (const { legacy, new: newKey } of legacyMappings) {
      try {
        const value = localStorage.getItem(legacy);
        if (value) {
          await storageManager.set(newKey, JSON.parse(value));
          localStorage.removeItem(legacy);
        }
      } catch (error) {
        console.warn(`Failed to migrate legacy key ${legacy}:`, error);
      }
    }
  }

  /**
   * Get storage usage for auth data
   */
  async getAuthStorageUsage(): Promise<{
    totalItems: number;
    totalSize: number;
    items: Array<{ key: string; size: number }>;
  }> {
    const allKeys = await storageManager.keys();
    const authKeys = allKeys.filter(key => 
      key.includes('auth') || 
      key.includes('token') || 
      key.includes('profile') ||
      key.includes('session')
    );

    const items: Array<{ key: string; size: number }> = [];
    let totalSize = 0;

    for (const key of authKeys) {
      try {
        const value = await storageManager.get(key);
        const size = new Blob([JSON.stringify(value)]).size;
        items.push({ key, size });
        totalSize += size;
      } catch (error) {
        console.warn(`Failed to get size for key ${key}:`, error);
      }
    }

    return {
      totalItems: items.length,
      totalSize,
      items
    };
  }
}

// Export singleton instance
export const authStorage = new AuthStorageService();