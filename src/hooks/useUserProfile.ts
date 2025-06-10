/**
 * Hook for fetching and managing user profile data
 * Integrates Supabase with BuildEase backend API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  hasProjectPermission,
  hasAnyProjectPermission,
  isAdminForAnyProject
 } from '@/services/userService';
import { UserProfile, ProjectPermission, UserRole, PermissionScope } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Query keys for React Query
export const USER_PROFILE_QUERY_KEY = ['user', 'profile'];

/**
 * Hook for fetching and managing user profile data
 * This hook integrates Supabase authentication with our backend API
 */
export function useUserProfile(): {
  profile: UserProfile | null;
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
  const { user, profile } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile data
  const profileQuery = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      // Only fetch if authenticated
      if (!user) return null;
      
      try {
        // Get profile directly from Supabase
        const { data, error } = await supabase
          .from('be_user')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Transform the Supabase data format to our UserProfile type
        return data as UserProfile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
    enabled: !!user, // Only run if authenticated
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<UserProfile>) => {
      if (!user) {
        throw new Error('Cannot update profile: User data not available.');
      }
      
      try {
        // Prepare data for Supabase auth update (if needed)
        // Supabase auth typically uses 'data' for metadata like full name, or individual fields if supported.
        // For simplicity, let's assume we want to update a display name if both first/last are present.
        const authUpdateData: { email?: string; data?: { [key: string]: any } } = {};
        if (updatedData.email) { // If email were editable, which it's not in our current Settings.tsx form
          authUpdateData.email = updatedData.email;
        }
        if (updatedData.firstName && updatedData.lastName) {
          authUpdateData.data = { 
            ...user.user_metadata, // Preserve existing metadata
            full_name: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
            // You might also store firstName and lastName separately if your auth setup uses it
            // first_name: updatedData.firstName,
            // last_name: updatedData.lastName,
          };
        } else if (updatedData.firstName) {
          authUpdateData.data = { ...user.user_metadata, full_name: updatedData.firstName.trim() };
        } else if (updatedData.lastName) {
          // Potentially less ideal, but an option if only lastName is provided for update
          authUpdateData.data = { ...user.user_metadata, full_name: updatedData.lastName.trim() }; 
        }

        if (Object.keys(authUpdateData).length > 0) {
          const { error: authError } = await supabase.auth.updateUser(authUpdateData);
          if (authError) throw authError;
        }
        
        // Prepare data for the be_user table, mapping to snake_case
        const profileUpdateData: { [key: string]: any } = {};
        if (updatedData.firstName !== undefined) profileUpdateData.first_name = updatedData.firstName;
        if (updatedData.lastName !== undefined) profileUpdateData.last_name = updatedData.lastName;
        if (updatedData.phone !== undefined) profileUpdateData.phone = updatedData.phone;
        if (updatedData.companyName !== undefined) profileUpdateData.company_name = updatedData.companyName;
        // For nested 'settings.pictureUrl'
        if (updatedData.settings?.pictureUrl !== undefined) {
          // Ensure 'settings' itself is an object if it wasn't before
          // This part depends on how your 'be_user' table stores 'settings'. Assuming it's a JSONB column.
          // And that `profileQuery.data.settings` contains the current full settings object.
          const currentSettings = profileQuery.data?.settings || {};
          profileUpdateData.settings = { 
            ...currentSettings, 
            pictureUrl: updatedData.settings.pictureUrl 
          };
        }
        // Always add updated_at
        profileUpdateData.updated_at = new Date().toISOString();

        // Update profile in be_user database table
        if (Object.keys(profileUpdateData).length > 1) { // only update if more than just updated_at
            const { error: profileError } = await supabase
              .from('be_user') // Changed from 'profiles' to 'be_user'
              .update(profileUpdateData)
              .eq('id', user.id);
              
            if (profileError) throw profileError;
        }
        
        // Fetch the updated profile from be_user table
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('be_user') // Changed from 'profiles' to 'be_user'
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (fetchError) throw fetchError;
        
        return updatedProfile as UserProfile;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, updatedProfile);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Helper function to check permission for a specific project
  const hasPermission = (projectId: string, permission: ProjectPermission): boolean => {
    if (!profileQuery.data) return false;
    return hasProjectPermission(profileQuery.data, projectId, permission);
  };

  // Helper function to check if user has any of the given permissions for a project
  const hasAnyPermission = (projectId: string, permissions: ProjectPermission[]): boolean => {
    if (!profileQuery.data) return false;
    return hasAnyProjectPermission(profileQuery.data, projectId, permissions);
  };

  // Helper function to check if user is admin for any project
  const isAdmin = (): boolean => {
    if (!profileQuery.data) return false;
    return isAdminForAnyProject(profileQuery.data);
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateSettings: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    refetchProfile: () => queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
    role: profileQuery.data?.role,
    permissions: profileQuery.data?.permissions || [],
  };
}
