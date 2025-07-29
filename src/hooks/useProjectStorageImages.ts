// src/hooks/useProjectStorageImages.ts
/**
 * Custom hook for fetching project images from Supabase storage buckets
 * Handles progress images, inspiration images, and other media stored in storage
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface StorageImage {
  id: string;
  name: string;
  url: string;
  size?: number;
  createdAt: string;
  category: string;
}

interface UseProjectStorageImagesReturn {
  images: StorageImage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch images from a specific Supabase storage bucket for a project
 */
export function useProjectStorageImages(
  projectId: string,
  bucket: string,
  category: string
): UseProjectStorageImagesReturn {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  const fetchImages = useCallback(async () => {
    if (!projectId || !user) {
      setImages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // List files in the storage bucket for this project
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list(`${projectId}/`, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        throw new Error(`Failed to fetch images: ${listError.message}`);
      }

      if (!files || files.length === 0) {
        setImages([]);
        return;
      }

      // Filter out folders and get only image files
      const imageFiles = files.filter(file => 
        file.name && 
        !file.name.endsWith('/') && 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
      );

      // Get public URLs for each image
      const imagePromises = imageFiles.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(`${projectId}/${file.name}`);

        return {
          id: `${category}-${file.name}`,
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size,
          createdAt: file.created_at || new Date().toISOString(),
          category,
        };
      });

      const resolvedImages = await Promise.all(imagePromises);
      setImages(resolvedImages);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMessage);
      console.error('Error fetching storage images:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, bucket, category, user]);

  // Fetch images on mount and when dependencies change
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    isLoading,
    error,
    refetch: fetchImages,
  };
}

/**
 * Convenience hook specifically for progress images
 */
export function useProjectProgressImages(projectId: string) {
  return useProjectStorageImages(projectId, 'progress-images', 'progress');
}

/**
 * Convenience hook specifically for inspiration images from storage
 * (Note: inspiration images might also be stored in project.inspiration_images array)
 */
export function useProjectInspirationStorageImages(projectId: string) {
  return useProjectStorageImages(projectId, 'project-inspiration', 'inspiration');
}
