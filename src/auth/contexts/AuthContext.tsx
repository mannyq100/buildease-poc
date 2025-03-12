import React, { createContext, useEffect, useReducer, useContext } from 'react';
import { User, AuthProvider as Provider, RegisterData } from '../types/auth';
import { getStoredToken, removeToken, setToken, getProviderToken, setProviderToken } from '../utils/token';
import { apiRequest } from '@/lib/api-client';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastProvider: Provider | null;
};

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; provider: Provider } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  socialLogin: (provider: Provider) => void;
  handleSocialLoginCallback: (provider: Provider, code: string) => Promise<void>;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastProvider: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        lastProvider: action.payload.provider,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        lastProvider: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on initial load
  useEffect(() => {
    async function initializeAuth() {
      const token = getStoredToken();
      
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No token found' });
        return;
      }
      
      try {
        // Validate token and get user info
        const user = await apiRequest<User>('/auth/me', {
          includeAuth: true
        });
        
        // Determine the provider from localStorage
        const provider = localStorage.getItem('auth_provider') as Provider || 'email';
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user, provider } 
        });
      } catch (error) {
        // Token invalid or expired
        removeToken();
        dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
      }
    }
    
    initializeAuth();
  }, []);

  // Traditional email/password login
  async function login(email: string, password: string) {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const data = await apiRequest<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        includeAuth: false
      });
      
      setToken(data.token);
      localStorage.setItem('auth_provider', 'email');
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: data.user, 
          provider: 'email' 
        } 
      });
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.message || 'Login failed' 
      });
    }
  }

  // Traditional registration
  async function register(userData: RegisterData) {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const data = await apiRequest<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: userData,
        includeAuth: false
      });
      
      setToken(data.token);
      localStorage.setItem('auth_provider', 'email');
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: data.user, 
          provider: 'email' 
        } 
      });
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.message || 'Registration failed' 
      });
    }
  }

  // Initialize social login by redirecting to provider
  function socialLogin(provider: Provider) {
    if (provider === 'email') {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: 'Invalid provider' 
      });
      return;
    }
    
    const clientId = getSocialClientId(provider);
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    
    let authUrl = '';
    
    switch (provider) {
      case 'google':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&prompt=select_account`;
        break;
      case 'facebook':
        authUrl = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email,public_profile`;
        break;
      case 'apple':
        authUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=name email&response_mode=form_post`;
        break;
      default:
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: `Unsupported provider: ${provider}` 
        });
        return;
    }
    
    // Store the current URL to return to after login
    sessionStorage.setItem('auth_redirect', window.location.pathname);
    
    // Redirect to provider's auth page
    window.location.href = authUrl;
  }

  // Handle the callback from social provider
  async function handleSocialLoginCallback(provider: Provider, code: string) {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Exchange code for token and user data
      const data = await apiRequest<{ user: User; token: string; providerToken?: string }>('/auth/social/callback', {
        method: 'POST',
        body: { provider, code },
        includeAuth: false
      });
      
      setToken(data.token);
      
      // Store provider-specific token if available
      if (data.providerToken) {
        setProviderToken(provider, data.providerToken);
      }
      
      localStorage.setItem('auth_provider', provider);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: data.user, 
          provider 
        } 
      });
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.message || `${provider} authentication failed` 
      });
    }
  }

  // Logout from any provider
  function logout() {
    try {
      console.log('AuthContext: Starting logout process');
      
      // Special handling for different providers if needed
      if (state.lastProvider === 'google') {
        const googleToken = getProviderToken('google');
        if (googleToken) {
          // Optional: revoke Google token
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleToken}`)
            .catch(err => console.log('Error revoking Google token:', err));
        }
      }
      
      console.log('AuthContext: Clearing tokens and storage');
      
      // Clear all tokens and auth state
      removeToken();
      localStorage.removeItem('auth_provider');
      
      // Clear all provider tokens
      ['google', 'facebook', 'apple'].forEach(provider => {
        localStorage.removeItem(`${provider}_token`);
      });

      // Clear any session storage that might be used
      sessionStorage.removeItem('auth_redirect');
      
      // Clear localStorage items that might be causing issues
      try {
        // Attempt to clear potential localStorage items
        const keysToRemove = ['user', 'auth_token', 'buildease_token', 'buildease_auth_token'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.error('Error clearing additional localStorage items:', e);
      }
      
      console.log('AuthContext: Dispatching LOGOUT action');
      
      // Dispatch logout action to reset auth state
      dispatch({ type: 'LOGOUT' });
      
      console.log('AuthContext: Logout completed successfully');
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
      // Still reset state in case of error
      dispatch({ type: 'LOGOUT' });
    }
  }

  // Update user profile
  async function updateProfile(userData: Partial<User>) {
    if (!state.user) return;
    
    try {
      const updatedUser = await apiRequest<User>('/auth/profile', {
        method: 'PUT',
        body: userData
      });
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }

  // Helper to get appropriate client ID for social provider
  function getSocialClientId(provider: Provider): string {
    switch (provider) {
      case 'google':
        return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      case 'facebook':
        return import.meta.env.VITE_FACEBOOK_APP_ID || '';
      case 'apple':
        return import.meta.env.VITE_APPLE_CLIENT_ID || '';
      default:
        return '';
    }
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateProfile,
        socialLogin,
        handleSocialLoginCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 