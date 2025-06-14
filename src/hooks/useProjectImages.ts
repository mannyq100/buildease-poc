/**
 * Hook for fetching and managing project images
 * Provides functionality to load, display, and manage project profile and inspiration images
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';
import { getProjectDisplayImage } from '@/utils/project/imageUtils';

interface ProjectImageData {
  profileImage: string | null;
  inspirationImages: string[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage project images
 * 
 * @param projectId - The ID of the project to fetch images for
 * @returns Object containing profile image, inspiration images, loading state, and error
 */
export function useProjectImages(projectId: string | undefined): ProjectImageData {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    async function fetchProjectImages() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from(TABLE_NAMES.PROJECTS)
          .select('profile_image, images')
          .eq('id', projectId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setProfileImage(data.profile_image);
          setInspirationImages(data.images || []);
        }
      } catch (err) {
        console.error('Error fetching project images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project images');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectImages();
  }, [projectId]);

  // Get the display image (profile image or default)
  const displayImage = getProjectDisplayImage(profileImage);

  return {
    profileImage: displayImage,
    inspirationImages: inspirationImages.length > 0 ? inspirationImages : (profileImage ? [profileImage] : []),
    isLoading,
    error
  };
}

/**
 * Hook to fetch and manage multiple projects' images
 * Useful for project lists and grids
 * 
 * @param projectIds - Array of project IDs to fetch images for
 * @returns Map of project IDs to their display images
 */
export function useMultipleProjectImages(projectIds: string[]): {
  projectImages: Record<string, string>;
  isLoading: boolean;
  error: string | null;
} {
  const [projectImages, setProjectImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectIds.length) {
      setIsLoading(false);
      return;
    }

    async function fetchMultipleProjectImages() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from(TABLE_NAMES.PROJECTS)
          .select('id, profile_image')
          .in('id', projectIds);

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          const imageMap: Record<string, string> = {};
          
          data.forEach(project => {
            imageMap[project.id] = getProjectDisplayImage(project.profile_image);
          });
          
          setProjectImages(imageMap);
        }
      } catch (err) {
        console.error('Error fetching multiple project images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project images');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMultipleProjectImages();
  }, [projectIds]);

  return { projectImages, isLoading, error };
}
