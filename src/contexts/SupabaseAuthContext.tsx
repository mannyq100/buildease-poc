import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole, UserProfile as UserProfileType } from '../types/user'; 
import { useNavigate } from 'react-router-dom';

// Define Permission type based on construction_mgr.permission_type enum
export type Permission = string; 

export interface ProjectMembership {
  projectId: string;
  projectName: string;
  role: UserRole;
  permissions: Permission[];
}

// Define UserSettings interface
export interface UserSettings {
  picture_url?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  // Add other potential user settings here
}

// Use the main UserProfile type from types/user.ts but extend with additional fields
interface UserProfile extends Omit<UserProfileType, 'settings' | 'projectPermissions' | 'permissions'> {
  avatarUrl?: string; // This will be derived from settings.picture_url
  settings?: UserSettings; // Keep the existing settings structure for backward compatibility
  projectMemberships: ProjectMembership[]; // Updated structure
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  authError: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: Error | null, user: User | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  clearAuthError: () => void;
  handleAuthError: (error: Error) => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and provides auth context
export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  
  // Use navigate for redirects
  const navigate = useNavigate();

  // Profile cache key with 5-minute expiration
  const PROFILE_CACHE_KEY = 'buildease_profile_cache';
  const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  // Fetch the user profile using the edge function with caching
  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoadingProfile(true);
      
      // Check cache first for better performance
      const cachedProfile = localStorage.getItem(`${PROFILE_CACHE_KEY}_${userId}`);
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        // Only use cache if it's not expired
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
          setProfile(parsed.profile);
          setIsLoadingProfile(false);
          return;
        }
      }
      
      // Call the edge function to get complete user profile
      const { data: profileData, error: profileError } = await supabase
        .schema('construction_mgr')
        .rpc('get_user_profile', { user_uuid: userId });

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setProfile(null);
        return;
      }

      if (!profileData) {
        console.error('No user profile found');
        setProfile(null);
        return;
      }
  console.log("User profile fetched:", profileData);
      // Transform the edge function response to match our UserProfile interface
      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        companyName: profileData.companyName,
        provider: profileData.provider || 'SUPABASE', // Default to SUPABASE if not provided
        tier: profileData.tier || 'BASIC', // Default to BASIC if not provided
        status: profileData.status || 'ACTIVE', // Default to ACTIVE if not provided
        role: profileData.role || 'client', // Default to client if not provided
        avatarUrl: profileData.avatarUrl,
        settings: profileData.settings,
        projectMemberships: profileData.projectMemberships || [],
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };

      setProfile(userProfile);
      
      // Cache the profile for future use
      localStorage.setItem(
        `${PROFILE_CACHE_KEY}_${userId}`,
        JSON.stringify({
          profile: userProfile,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  // Clear profile cache efficiently
  const clearProfileCache = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PROFILE_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  };

  // Initialize auth state on component mount
  useEffect(() => {
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    // Event listener for profile refresh requests
    const handleProfileRefresh = async (event: CustomEvent) => {
      console.log('Received profile refresh event:', event.detail);
      const { userId, reason } = event.detail;
      if (user?.id === userId && isMounted) {
        console.log(`Refreshing user profile due to: ${reason}`);
        clearProfileCache();
        await fetchUserProfile(userId);
      }
    };
    
    // Listen for custom profile refresh events
    window.addEventListener('refreshUserProfile', handleProfileRefresh as EventListener);
    
    const initAuth = async () => {
      // Set loading state while we initialize
      setIsLoading(true);
      
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            clearProfileCache();
          }
          return;
        }
        
        if (isMounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            setUser(currentSession.user);
            await fetchUserProfile(currentSession.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        // Authentication state is initialized
        if (isMounted) {
          setIsLoading(false);
        }
      }
      
      // Setup the auth state change listener
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;
        
        // Only set loading for critical auth events
        const criticalEvents = ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'];
        if (criticalEvents.includes(event)) {
          setIsLoading(true);
        }
        
        try {
          setSession(newSession);
          
          if (newSession?.user) {
            setUser(newSession.user);
            await fetchUserProfile(newSession.user.id);
          } else {
            setUser(null);
            setProfile(null);
            
            if (event === 'SIGNED_OUT') {
              clearProfileCache();
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          handleAuthError(error as Error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      });
      
      // Store the auth listener for cleanup
      authListener = data;
    };
    
    // Initialize authentication
    initAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      // Remove event listener
      window.removeEventListener('refreshUserProfile', handleProfileRefresh as EventListener);
    };
  }, []);

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Set auth error but don't redirect - we want to show the error on the login form
        setAuthError(error);
        // Don't call handleAuthError here as we're still on the login page
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing in with email:', error);
      setAuthError(error as Error);
      return { error: error as Error };
    }
  };

  // Sign in with magic link (OTP)
  const signInWithOtp = async (email: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        setAuthError(error);
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing in with OTP:', error);
      setAuthError(error as Error);
      return { error: error as Error };
    }
  };

  // Sign in with social provider
  const signInWithProvider = async (provider: Provider) => {
    try {
      setAuthError(null);
      
      // Configure provider-specific options for the best user experience
      let scopes = '';
      let queryParams: Record<string, any> | undefined = undefined;
      
      // Set appropriate scopes and params based on provider
      switch(provider) {
        case 'google':
          scopes = 'profile email';
          queryParams = {
            access_type: 'offline',
            prompt: 'consent',
          };
          break;
        case 'facebook':
          scopes = 'email,public_profile';
          break;
        case 'linkedin':
          scopes = 'r_emailaddress r_liteprofile';
          break;
        // Add other providers as needed
      }
      
      // Call Supabase Auth with provider-specific config
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes,
          queryParams,
        },
      });
      
      if (error) {
        // Set auth error but don't redirect - we want to show the error on the login form
        setAuthError(error);
        throw error;
      }
      
      // No need to redirect here, the OAuth provider will handle it
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setAuthError(error as Error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setAuthError(null);
      // Create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Store user data in the auth metadata for the sync trigger
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            company_name: userData.companyName || '',
            phone: userData.phone || '',
            avatar_url: userData.avatarUrl || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Error signing up:', signUpError);
        setAuthError(signUpError);
        return { error: signUpError, user: null };
      }

      if (!authData.user) {
        const error = new Error('User creation failed');
        setAuthError(error);
        return { error, user: null };
      }
      
      // No need to manually create be_user profile - the auth trigger will handle this automatically
      // This avoids duplicate inserts and conflicts with the sync_new_auth_user trigger
      
      return { error: null, user: authData.user };
    } catch (error) {
      console.error('Error in signup process:', error);
      setAuthError(error as Error);
      return { error: error as Error, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    // Clear any auth errors before sign out
    setAuthError(null);
    
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    clearProfileCache();
  };

  // Update user profile in construction_mgr.be_user
  const updateProfile = async (data: Partial<UserProfile> & { avatarFile?: File }) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }

    try {
      // 1. Prepare the update payload for construction_mgr.be_user
      const updatePayload: Record<string, any> = {};
      
      // Only include fields that are defined in the input
      if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
      if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.companyName !== undefined) updatePayload.company_name = data.companyName;
      if (data.email && data.email !== user.email) updatePayload.email = data.email;
      // Handle settings updates (both avatar and notification settings)
      if (data.avatarUrl !== undefined || data.settings?.notifications) {
        updatePayload.settings = {
          ...(profile?.settings || {}),
          // Update picture_url if provided
          ...(data.avatarUrl !== undefined ? { picture_url: data.avatarUrl } : {}),
          // Update notification settings if provided
          ...(data.settings?.notifications ? { 
            notifications: {
              ...(profile?.settings?.notifications || {}),
              ...data.settings.notifications
            } 
          } : {})
        };
      };
      
      // 2. Update the user profile in construction_mgr.be_user
      if (Object.keys(updatePayload).length > 0) {
        updatePayload.updated_at = new Date().toISOString();
        console.log("Updating user profile in construction_mgr.be_user", updatePayload);
        const { error: updateError } = await supabase
          .schema('construction_mgr')
          .from('be_user')
          .update(updatePayload)
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user profile in construction_mgr.be_user:', updateError);
          return { error: updateError };
        }

        // 3. Immediately update the local state with the new profile data
        if (profile) {
          // Create updated profile with new values while preserving existing data
          const updatedProfile: UserProfile = {
            ...profile,
            // Update specific fields from the data object
            ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
            ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
            ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            // Update settings if needed
            settings: {
              ...(profile.settings || {}),
              ...(data.avatarUrl !== undefined ? { picture_url: data.avatarUrl } : {})
            }
          };
          
          // Update the profile state
          setProfile(updatedProfile);
          
          // Update the profile cache with the latest data
          if (user) {
            localStorage.setItem(
              `${PROFILE_CACHE_KEY}_${user.id}`,
              JSON.stringify({
                profile: updatedProfile,
                timestamp: Date.now()
              })
            );
          }
        }
      } else {
        // No fields to update
        return { error: null };
      }

      // We've already updated the cache and local state, no need to fetch again
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        setAuthError(error);
      }
      
      return { error };
    } catch (error) {
      console.error('Error resetting password:', error);
      setAuthError(error as Error);
      return { error: error as Error };
    }
  };

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
    // Additionally clear any error params from the URL if present
    if (window.history && window.location.search && 
        (window.location.search.includes('error=') || window.location.search.includes('message='))) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  // Handle authentication errors - shows error message, signs out, and redirects to login
  const handleAuthError = (error: Error) => {
    // Set the error to display to the user
    setAuthError(error);
    
    // Display toast message with the error
    // Note: We're relying on the components to display this error from authError state
    
    // Sign out the user
    signOut();
    
    // Redirect to login page with error message
    navigate('/login', { 
      state: { 
        error: error.message, 
        message: 'Please sign in again to continue.'
      }, 
      replace: true 
    });
  };

  // Context value
  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isLoadingProfile,
    isAuthenticated: !!user && !!profile,
    authError,
    signInWithEmail,
    signInWithOtp,
    signInWithProvider,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    clearAuthError,
    handleAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
