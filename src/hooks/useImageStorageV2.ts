/**
 * useImageStorageV2 Hook
 * 
 * Enhanced image storage hook using the unified storage system
 * Handles blob URLs properly and uses IndexedDB for better performance
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { storageManager } from '@/utils/storage/StorageManager';
import { StoredImage } from '@/utils/storage/types';
import { STORAGE_CONFIG } from '@/utils/storage/constants';
import { v4 as uuidv4 } from 'uuid';

interface UseImageStorageV2Props {
  storageKey: string;
  maxImages?: number;
  maxSizeMB?: number;
  generateThumbnails?: boolean;
}

interface UseImageStorageV2Return {
  images: StoredImage[];
  profileImageId: string | null;
  isLoading: boolean;
  error: string | null;
  addImage: (file: File) => Promise<string>;
  removeImage: (id: string) => void;
  setProfileImage: (id: string) => void;
  clearImages: () => void;
  getImageFiles: () => File[];
  getImageBlob: (id: string) => Promise<Blob | null>;
  getThumbnail: (id: string) => Promise<Blob | null>;
}

/**
 * Create a thumbnail from an image file
 */
const createThumbnail = async (file: File, maxSize: number = 200, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Main hook implementation
 */
export function useImageStorageV2({
  storageKey,
  maxImages = STORAGE_CONFIG.INDEXED_DB.MAX_IMAGES_COUNT,
  maxSizeMB = STORAGE_CONFIG.INDEXED_DB.MAX_IMAGE_SIZE_MB,
  generateThumbnails = true
}: UseImageStorageV2Props): UseImageStorageV2Return {
  // State
  const [images, setImages] = useState<StoredImage[]>([]);
  const [profileImageId, setProfileImageIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Storage keys
  const imagesKey = `${storageKey}_images`;
  const profileKey = `${storageKey}_profile`;

  /**
   * Load images from storage on mount
   */
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const [storedImages, storedProfileId] = await Promise.all([
          storageManager.get<StoredImage[]>(imagesKey, []),
          storageManager.get<string | null>(profileKey, null)
        ]);

        if (mountedRef.current) {
          setImages(storedImages || []);
          setProfileImageIdState(storedProfileId);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load images');
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadImages();
  }, [imagesKey, profileKey]);

  /**
   * Cleanup blob URLs on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Clean up any blob URLs we created
      blobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore cleanup errors
        }
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  /**
   * Save images to storage
   */
  const saveImages = useCallback(async (newImages: StoredImage[]) => {
    try {
      await storageManager.set(imagesKey, newImages, {
        expiresIn: STORAGE_CONFIG.CACHE_EXPIRY.IMAGES
      });
      setImages(newImages);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save images');
    }
  }, [imagesKey]);

  /**
   * Save profile image ID
   */
  const saveProfileImageId = useCallback(async (id: string | null) => {
    try {
      if (id) {
        await storageManager.set(profileKey, id);
      } else {
        await storageManager.remove(profileKey);
      }
      setProfileImageIdState(id);
    } catch (err) {
      console.error('Failed to save profile image ID:', err);
    }
  }, [profileKey]);

  /**
   * Add a new image
   */
  const addImage = useCallback(async (file: File): Promise<string> => {
    try {
      console.log('🖼️ Adding image:', file.name, file.type, file.size);
      setIsLoading(true);
      setError(null);

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPG, PNG or WebP images');
      }

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
      }

      // Check image limit
      if (images.length >= maxImages) {
        throw new Error(`You can only upload up to ${maxImages} images`);
      }

      // Generate unique ID
      const id = uuidv4();

      // Create thumbnail if enabled
      let thumbnail: Blob | undefined;
      if (generateThumbnails) {
        try {
          thumbnail = await createThumbnail(file);
        } catch (err) {
          console.warn('Failed to create thumbnail:', err);
        }
      }

      // Create stored image
      const storedImage: StoredImage = {
        id,
        file,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          tags: [],
          createdAt: Date.now()
        },
        thumbnail
      };

      // Save to storage and update state
      const newImages = [...images, storedImage];
      console.log('💾 Saving image to storage, total images:', newImages.length);
      await saveImages(newImages);

      // Set as profile image if it's the first one
      if (newImages.length === 1 && !profileImageId) {
        await saveProfileImageId(id);
      }

      console.log('✅ Image added successfully with id:', id);
      return id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [images, maxImages, maxSizeMB, generateThumbnails, profileImageId, saveImages, saveProfileImageId]);

  /**
   * Remove an image
   */
  const removeImage = useCallback(async (id: string) => {
    try {
      const newImages = images.filter(img => img.id !== id);
      await saveImages(newImages);

      // Update profile image if removed
      if (profileImageId === id) {
        const newProfileId = newImages.length > 0 ? newImages[0].id : null;
        await saveProfileImageId(newProfileId);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image');
    }
  }, [images, profileImageId, saveImages, saveProfileImageId]);

  /**
   * Set profile image
   */
  const setProfileImage = useCallback(async (id: string) => {
    if (images.some(img => img.id === id)) {
      await saveProfileImageId(id);
    }
  }, [images, saveProfileImageId]);

  /**
   * Clear all images
   */
  const clearImages = useCallback(async () => {
    try {
      await Promise.all([
        storageManager.remove(imagesKey),
        storageManager.remove(profileKey)
      ]);
      
      setImages([]);
      setProfileImageIdState(null);
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear images');
    }
  }, [imagesKey, profileKey]);

  /**
   * Get File objects from stored images
   */
  const getImageFiles = useCallback((): File[] => {
    return images.map(img => img.file);
  }, [images]);

  /**
   * Get image blob with caching
   */
  const getImageBlob = useCallback(async (id: string): Promise<Blob | null> => {
    const image = images.find(img => img.id === id);
    if (!image) return null;

    try {
      // File is already a Blob, just return it directly
      return image.file;
    } catch (err) {
      console.error('Failed to get image blob:', err);
      return null;
    }
  }, [images]);

  /**
   * Get thumbnail blob
   */
  const getThumbnail = useCallback(async (id: string): Promise<Blob | null> => {
    const image = images.find(img => img.id === id);
    if (!image) return null;

    // Return thumbnail if available
    if (image.thumbnail) {
      return image.thumbnail;
    }

    // Generate thumbnail on demand if not available
    if (generateThumbnails) {
      try {
        return await createThumbnail(image.file);
      } catch (err) {
        console.error('Failed to generate thumbnail:', err);
      }
    }

    return null;
  }, [images, generateThumbnails]);

  return {
    images,
    profileImageId,
    isLoading,
    error,
    addImage,
    removeImage,
    setProfileImage,
    clearImages,
    getImageFiles,
    getImageBlob,
    getThumbnail
  };
}