/**
 * Hook for fetching and managing user profile data.
 * This hook acts as a simplified interface to the SupabaseAuthContext,
 * providing the user profile and related helper functions.
 */
import { useState, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UserProfile, ProjectPermission, UserRole } from '@/types/user';

/**
 * Hook for accessing user profile data and actions.
 * It abstracts the profile state management from SupabaseAuthContext.
 */
export function useUserProfile(): {
  profile: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  updateSettings: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  isUpdating: boolean;
  hasPermission: (projectId: string, permission: ProjectPermission) => boolean;
  hasAnyPermission: (projectId: string, permissions: ProjectPermission[]) => boolean;
  isAdmin: () => boolean;
  refetchProfile: () => void;
  role?: UserRole;
} {
  const { 
    profile, 
    isLoadingProfile, 
    authError, 
    updateProfile,
    user 
  } = useSupabaseAuth();
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Wrapper for updateProfile to manage a local updating state
  const handleUpdateSettings = useCallback(async (data: Partial<UserProfile>) => {
    setIsUpdating(true);
    try {
      const result = await updateProfile(data);
      if (result.error) {
        // Error is handled in the context with a toast, but we can also log it here
        console.error('Update failed:', result.error);
      }
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, [updateProfile]);

  // Helper function to check permission for a specific project
  const hasPermission = useCallback((projectId: string, permission: ProjectPermission): boolean => {
    if (!profile || !profile.projectMemberships) return false;
    const membership = profile.projectMemberships.find(m => m.projectId === projectId);
    if (!membership) return false;
    // Check for admin role first, which grants all permissions
    if (membership.role === 'admin' || membership.role === 'owner') return true;
    return membership.permissions.includes(permission);
  }, [profile]);

  // Helper function to check if user has any of the given permissions for a project
  const hasAnyPermission = useCallback((projectId: string, permissions: ProjectPermission[]): boolean => {
    if (!profile || !profile.projectMemberships) return false;
    const membership = profile.projectMemberships.find(m => m.projectId === projectId);
    if (!membership) return false;
    // Check for admin role first
    if (membership.role === 'admin' || membership.role === 'owner') return true;
    return permissions.some(p => membership.permissions.includes(p));
  }, [profile]);

  // Helper function to check if user is admin for any project
  const isAdmin = useCallback((): boolean => {
    if (!profile || !profile.projectMemberships) return false;
    return profile.projectMemberships.some(m => m.role === 'admin' || m.role === 'owner');
  }, [profile]);

  // Function to manually trigger a profile refresh
  const refetchProfile = useCallback(() => {
    if (user?.id) {
      const event = new CustomEvent('refreshUserProfile', {
        detail: { userId: user.id, reason: 'Manual refresh from useUserProfile' },
      });
      window.dispatchEvent(event);
    } else {
      console.warn('Cannot refetch profile: user is not available.');
    }
  }, [user?.id]);

  return {
    profile,
    isLoading: isLoadingProfile,
    isError: !!authError,
    error: authError,
    updateSettings: handleUpdateSettings,
    isUpdating,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    refetchProfile,
    role: profile?.role,
  };
}
