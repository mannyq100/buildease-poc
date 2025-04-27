/**
 * Hook for fetching and managing user profile data
 * Integrates Auth0 with BuildEase backend API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  registerUser, 
  updateUserFullProfile, // Import the new function
  hasProjectPermission,
  hasAnyProjectPermission,
  isAdminForAnyProject
 } from '@/services/userService';
import type { AuthProvider } from '@/types/user';
import { UserProfile, UserSettings, ProjectPermission, UserRole, PermissionScope, RegisterUserPayload } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { setToken } from '@/lib/token';

// Query keys for React Query
export const USER_PROFILE_QUERY_KEY = ['user', 'profile'];

/**
 * Hook for fetching and managing user profile data
 * This hook integrates Auth0 authentication with our backend API
 */
export function useUserProfile(): {
  profile: UserProfile | null;
  auth0User: any;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  updateSettings: (data: Partial<UserProfile>) => void;
  isUpdating: boolean;
  hasPermission: (projectId: string, permission: ProjectPermission) => boolean;
  hasAnyPermission: (projectId: string, permissions: ProjectPermission[]) => boolean;
  isAdmin: () => boolean;
  refetchProfile: () => void;
  role?: UserRole;
  permissions: PermissionScope[];
} {
  const { isAuthenticated, getAccessTokenSilently, user: auth0User } = useAuth0();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile data
  const profileQuery = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      // Only fetch if authenticated
      if (!isAuthenticated || !auth0User) return null;
      
      try {
        // Get fresh token from Auth0 before making the request
        const token = await getAccessTokenSilently();
        
        // Store the token for API requests
        setToken(token);
        
        // Build full payload from Auth0 ID token claims
        const [rawProvider, providerIdentifier] = auth0User.sub.split('|');
        const mappedProvider: AuthProvider = (() => {
          switch (rawProvider) {
            case 'google-oauth2': return 'GOOGLE';
            case 'google':        return 'GOOGLE';
            case 'facebook':      return 'FACEBOOK';
            case 'github':        return 'GITHUB';
            case 'apple':         return 'APPLE';
            default:              return 'AUTH0';
          }
        })();
        const newUser: RegisterUserPayload = {
          email: auth0User.email!,
          name: auth0User.name,
          phone: auth0User.phone_number,
          provider: mappedProvider,
          providerIdentifier: providerIdentifier,
          tier: 'BASIC', // Default tier, might be updated by backend
          status: 'ACTIVE', // Default status
          settings: {
            pictureUrl: auth0User.picture,
            emailVerified: auth0User.email_verified ?? false,
            phoneVerified: auth0User.phone_verified ?? false,
            notifications: { email: true, push: true }, // Default notifications
            language: auth0User.locale ?? 'en', // Default language
            currency: 'USD' // Default currency
          },
          // Assuming notifications structure might be separate based on previous type definitions
          notifications: { email: true, push: true } 
        };
        console.log('useUserProfile queryFn: Calling registerUser with payload:', newUser);
        // Call registerUser which handles find-or-create logic
        const returnedProfile = await registerUser(newUser);
        console.log('useUserProfile queryFn: registerUser returned:', returnedProfile);
        return returnedProfile; // Ensure the fetched profile is returned
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Log specific error details
        if (error instanceof Error) {
          console.error('useUserProfile queryFn Error details:', { name: error.name, message: error.message, stack: error.stack });
        } else {
          console.error('useUserProfile queryFn caught non-Error:', error);
        }
        throw error; // Re-throw to let React Query handle it
      }
    },
    enabled: isAuthenticated && !!auth0User, // Only run if authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation for updating user settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const currentProfile = queryClient.getQueryData<UserProfile>(USER_PROFILE_QUERY_KEY);

      if (!currentProfile) {
        throw new Error('Cannot update profile: Current profile data not available.');
      }

      // Need auth0User to get providerIdentifier
      if (!auth0User || !auth0User.sub) {
        throw new Error('Cannot update profile: Auth0 user data (sub) not available.');
      }

      const [_, providerIdentifier] = auth0User.sub.split('|');

      // Handle profile picture data - if it's a blob URL, we need to convert it to base64
      let pictureUrl = data.settings?.pictureUrl || currentProfile.settings.pictureUrl;
      
      // Check if the picture URL is a blob URL (from a file upload)
      if (pictureUrl && pictureUrl.startsWith('blob:')) {
        try {
          // Convert blob URL to base64 data URL
          const response = await fetch(pictureUrl);
          const blob = await response.blob();
          
          return new Promise<UserProfile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                // Now we have the base64 data URL
                const base64Data = reader.result as string;
                
                // Construct the full payload with the base64 image data
                const fullPayload: RegisterUserPayload = {
                  // Fields typically derived from auth or stable
                  id: currentProfile.id,
                  email: currentProfile.email,
                  provider: currentProfile.provider,
                  providerIdentifier: providerIdentifier,
                  tier: currentProfile.tier,
                  status: currentProfile.status,

                  // Fields potentially updated from the partial 'data' input
                  name: data.name !== undefined ? data.name : currentProfile.name,
                  phone: data.phone !== undefined ? data.phone : currentProfile.phone,

                  // Update settings with the base64 image data
                  settings: {
                    ...currentProfile.settings,
                    ...data.settings,
                    pictureUrl: base64Data
                  },
                  notifications: currentProfile.settings.notifications
                };

                // Get fresh token before making the request
                const token = await getAccessTokenSilently();
                setToken(token);

                // Call the service function with the full payload
                const result = await updateUserFullProfile(fullPayload);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = () => {
              reject(new Error('Failed to read the image file'));
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error processing profile picture:', error);
          throw error;
        }
      }

      // If we're not dealing with a blob URL, proceed normally
      // Construct the full payload required by updateUserFullProfile
      const fullPayload: RegisterUserPayload = {
        // Fields typically derived from auth or stable
        id: currentProfile.id,
        email: currentProfile.email,
        provider: currentProfile.provider,
        providerIdentifier: providerIdentifier,
        tier: currentProfile.tier,
        status: currentProfile.status,

        // Fields potentially updated from the partial 'data' input
        name: data.name !== undefined ? data.name : currentProfile.name,
        phone: data.phone !== undefined ? data.phone : currentProfile.phone,

        // Settings and Notifications might need merging
        settings: {
          ...currentProfile.settings,
          ...data.settings
        },
        notifications: currentProfile.settings.notifications
      };

      console.log('useUserProfile updateMutation: Calling updateUserFullProfile with payload:', fullPayload);

      // Get fresh token before making the request
      const token = await getAccessTokenSilently();
      setToken(token);

      // Call the service function with the full payload
      return updateUserFullProfile(fullPayload);
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with the new profile data returned from the PUT request
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, updatedProfile);
      toast({
        title: 'Settings updated',
        description: 'Your settings have been successfully updated.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: 'Update failed',
        description: 'There was a problem updating your settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Check if the user has a specific permission for a project
  const hasPermission = (projectId: string, permission: ProjectPermission): boolean => {
    const profile = profileQuery.data;
    return hasProjectPermission(profile, projectId, permission);
  };

  // Check if the user has any of the specified permissions for a project
  const hasAnyPermission = (projectId: string, permissions: ProjectPermission[]): boolean => {
    const profile = profileQuery.data;
    return hasAnyProjectPermission(profile, projectId, permissions);
  };

  // Check if the user is an admin for any project
  const isAdmin = (): boolean => {
    const profile = profileQuery.data;
    return isAdminForAnyProject(profile);
  };

  return {
    // Data
    profile: profileQuery.data,
    role: profileQuery.data?.role,
    permissions: profileQuery.data?.permissions ?? [],
    auth0User, // Include the Auth0 user object for reference
    
    // Loading states
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    
    // Mutations
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    
    // Permissions
    hasPermission,
    hasAnyPermission,
    isAdmin,
    
    // Refetch methods
    refetchProfile: profileQuery.refetch,
  };
}
