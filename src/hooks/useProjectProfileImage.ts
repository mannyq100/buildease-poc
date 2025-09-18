/**
 * Hook to fetch current project profile image by querying media items directly
 * This is the primary method for getting accurate, up-to-date profile images
 * 
 * Why this approach is better than using project.profile_image_url:
 * - Always queries live data from be_media_items table
 * - Avoids issues with outdated URLs when media items are deleted
 * - Provides accurate mediaId for URL refresh functionality
 * - Returns null when no profile image exists (clean fallback)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ProfileImageData {
  id: string;
  file_path: string;
  thumbnail_url?: string | null;
  created_at: string;
}

export function useProjectProfileImage(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-profile-image', projectId],
    queryFn: async (): Promise<ProfileImageData | null> => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const { data, error } = await supabase
        .from('be_media_items')
        .select('id, file_path, thumbnail_url, created_at')
        .eq('project_id', projectId)
        .eq('category', 'profile')
        .eq('media_type', 'PHOTO')
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch profile image: ${error.message}`);
      }

      return data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Utility function to get profile image URLs from profile image data
 */
export function getProfileImageUrls(profileData: ProfileImageData | null | undefined) {
  if (!profileData) {
    return { imageUrl: null, thumbnailUrl: null, mediaId: null };
  }

  return {
    imageUrl: profileData.file_path,
    thumbnailUrl: profileData.thumbnail_url || profileData.file_path,
    mediaId: profileData.id,
  };
}