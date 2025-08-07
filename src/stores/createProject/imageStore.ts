/**
 * Project Image Store
 * Manages image upload and preview state for project creation wizard
 * Follows BuildEase standards: focused responsibility, under 400 lines
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { devtools } from 'zustand/middleware';
import { uploadFile } from '@/utils/core/storageUtils';

// Local image file interface
export interface LocalImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

// Serializable image data for localStorage
interface SerializableImageFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string;
  fileData: string; // Base64 encoded file data
}

// Image state interface
export interface ImageState {
  localFiles: LocalImageFile[];
  localProfileImageId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
}

// Image store state
export interface ImageStoreState extends ImageState {
  // Actions
  addLocalImage: (file: File) => void;
  removeLocalImage: (id: string) => void;
  setProfileImage: (id: string | null) => void;
  clearAllImages: () => void;
  uploadImages: (userId: string, projectId: string) => Promise<{ images: string[]; profileImage: string | null }>;
  setUploadProgress: (progress: number) => void;
  setUploadError: (error: string | null) => void;
  resetUploadState: () => void;
}

// Utility function to create blob URL from file
function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

// Utility function to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// LocalStorage key
const STORAGE_KEY = 'buildease-project-images';

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Convert base64 back to File
function base64ToFile(base64: string, fileName: string, fileType: string): File {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], fileName, { type: fileType });
}

// Save images to localStorage
function saveToLocalStorage(images: LocalImageFile[], profileImageId: string | null): void {
  try {
    Promise.all(
      images.map(async (img) => {
        try {
          const fileData = await fileToBase64(img.file);
          return {
            id: img.id,
            fileName: img.file.name,
            fileType: img.file.type,
            fileSize: img.file.size,
            previewUrl: img.previewUrl,
            fileData
          };
        } catch (error) {
          console.warn('Failed to serialize image:', img.file.name, error);
          return null;
        }
      })
    ).then(results => {
      const validResults = results.filter(Boolean) as SerializableImageFile[];
      const storageData = {
        images: validResults,
        profileImageId,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    }).catch(error => {
      console.warn('Failed to save images to localStorage:', error);
    });
  } catch (error) {
    console.warn('Error saving to localStorage:', error);
  }
}

// Load images from localStorage
function loadFromLocalStorage(): { images: LocalImageFile[]; profileImageId: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { images: [], profileImageId: null };
    
    const data = JSON.parse(stored);
    
    // Check if data is stale (older than 24 hours)
    const isStale = Date.now() - (data.timestamp || 0) > 24 * 60 * 60 * 1000;
    if (isStale) {
      localStorage.removeItem(STORAGE_KEY);
      return { images: [], profileImageId: null };
    }
    
    const images: LocalImageFile[] = data.images.map((serialized: SerializableImageFile) => {
      try {
        const file = base64ToFile(serialized.fileData, serialized.fileName, serialized.fileType);
        return {
          id: serialized.id,
          file,
          previewUrl: serialized.previewUrl
        };
      } catch (error) {
        console.warn('Failed to deserialize image:', serialized.fileName, error);
        return null;
      }
    }).filter(Boolean);
    
    return {
      images,
      profileImageId: data.profileImageId
    };
  } catch (error) {
    console.warn('Error loading from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
    return { images: [], profileImageId: null };
  }
}

// Clear localStorage
function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Default image state
const getDefaultImageState = (): ImageState => {
  // Load from localStorage on initialization
  const stored = loadFromLocalStorage();
  return {
    localFiles: stored.images,
    localProfileImageId: stored.profileImageId,
    isUploading: false,
    uploadProgress: 0,
    uploadError: null
  };
};

// Image validation
function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, HEIC, and GIF images are allowed';
  }
  
  if (file.size > maxSize) {
    return 'Image must be smaller than 10MB';
  }
  
  return null;
}

// Upload a single image file
async function uploadSingleImage(
  file: File,
  userId: string,
  projectId: string,
  _isProfile: boolean = false
): Promise<string> {
  // Per new flow, all images (including profile) go into the 'project-inspiration' bucket
  const bucket = 'project-inspiration';
  
  const uploadResult = await uploadFile(file, {
    bucket,
    userId,
    projectId,
    // Keep allowed types aligned with validation
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'],
    maxSizeMB: 10,
    onProgress: undefined // Progress handled at higher level
  });
  
  if (!uploadResult.success || !uploadResult.publicUrl) {
    throw new Error(uploadResult.error || 'Upload failed');
  }
  
  return uploadResult.publicUrl;
}

// Create the image store
export const useImageStore = create<ImageStoreState>()(
  devtools(
    (set, get) => ({
      ...getDefaultImageState(),

      addLocalImage: (file) => {
        const validationError = validateImageFile(file);
        if (validationError) {
          set({ uploadError: validationError }, false, 'addLocalImage/error');
          return;
        }

        const id = generateId();
        const previewUrl = createPreviewUrl(file);
        const newImage: LocalImageFile = { id, file, previewUrl };

        set((state) => {
          const newFiles = [...state.localFiles, newImage];
          // Save to localStorage
          saveToLocalStorage(newFiles, state.localProfileImageId);
          
          return {
            localFiles: newFiles,
            uploadError: null
          };
        }, false, 'addLocalImage');
      },

      removeLocalImage: (id) => {
        set((state) => {
          const imageToRemove = state.localFiles.find(img => img.id === id);
          if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.previewUrl);
          }

          const newFiles = state.localFiles.filter(img => img.id !== id);
          const newProfileImageId = state.localProfileImageId === id ? null : state.localProfileImageId;
          
          // Save to localStorage
          saveToLocalStorage(newFiles, newProfileImageId);

          return {
            localFiles: newFiles,
            localProfileImageId: newProfileImageId
          };
        }, false, 'removeLocalImage');
      },

      setProfileImage: (id) => {
        set((state) => {
          // Save to localStorage
          saveToLocalStorage(state.localFiles, id);
          
          return { localProfileImageId: id };
        }, false, 'setProfileImage');
      },

      clearAllImages: () => {
        const { localFiles } = get();
        localFiles.forEach(img => URL.revokeObjectURL(img.previewUrl));
        
        // Clear localStorage
        clearLocalStorage();
        
        set({
          localFiles: [],
          localProfileImageId: null,
          isUploading: false,
          uploadProgress: 0,
          uploadError: null
        }, false, 'clearAllImages');
      },

      uploadImages: async (userId, projectId) => {
        const { localFiles, localProfileImageId } = get();
        
        if (localFiles.length === 0) {
          return { images: [], profileImage: null };
        }

        set({ isUploading: true, uploadProgress: 0, uploadError: null }, false, 'uploadImages/start');

        try {
          const uploadPromises = localFiles.map(async (localFile, index) => {
            const isProfile = localFile.id === localProfileImageId;
            
            try {
              const url = await uploadSingleImage(localFile.file, userId, projectId, isProfile);
              
              // Update progress
              const progress = ((index + 1) / localFiles.length) * 100;
              set({ uploadProgress: progress }, false, 'uploadImages/progress');
              
              return { url, isProfile, id: localFile.id };
            } catch (error) {
              throw new Error(`Failed to upload ${localFile.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          });

          const uploadResults = await Promise.all(uploadPromises);
          
          const images = uploadResults
            .filter(result => !result.isProfile)
            .map(result => result.url);
          
          const profileImageResult = uploadResults.find(result => result.isProfile);
          const profileImage = profileImageResult?.url || null;

          set({ 
            isUploading: false, 
            uploadProgress: 100,
            uploadError: null 
          }, false, 'uploadImages/success');

          return { images, profileImage };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          set({ 
            isUploading: false, 
            uploadError: errorMessage 
          }, false, 'uploadImages/error');
          
          throw error;
        }
      },

      setUploadProgress: (progress) =>
        set({ uploadProgress: progress }, false, 'setUploadProgress'),

      setUploadError: (error) =>
        set({ uploadError: error }, false, 'setUploadError'),

      resetUploadState: () =>
        set({ 
          isUploading: false, 
          uploadProgress: 0, 
          uploadError: null 
        }, false, 'resetUploadState')
    }),
    { name: 'image-store' }
  )
);

// Convenience hooks with proper shallow comparison

export function useImageState() {
  return useImageStore(
    useShallow((state) => ({
      localFiles: state.localFiles,
      localProfileImageId: state.localProfileImageId,
      isUploading: state.isUploading,
      uploadProgress: state.uploadProgress,
      uploadError: state.uploadError,
    }))
  );
}

export function useImageActions() {
  return useImageStore(
    useShallow((state) => ({
      addLocalImage: state.addLocalImage,
      removeLocalImage: state.removeLocalImage,
      setProfileImage: state.setProfileImage,
      clearAllImages: state.clearAllImages,
      uploadImages: state.uploadImages,
      setUploadProgress: state.setUploadProgress,
      setUploadError: state.setUploadError,
      resetUploadState: state.resetUploadState,
    }))
  );
}

// Cleanup function for resetting store state
export function resetImageStoreCaches() {
  // No cached variables to reset in current implementation
  // This function is kept for potential future use
}

