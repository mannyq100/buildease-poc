/**
 * Project Image Store
 * Manages image upload and preview state for project creation wizard
 * Follows BuildEase standards: focused responsibility, under 400 lines
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { uploadFile } from '@/utils/core/storageUtils';

// Local image file interface
export interface LocalImageFile {
  id: string;
  file: File;
  previewUrl: string;
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
  uploadImages: (userId: string) => Promise<{ images: string[]; profileImage: string | null }>;
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

// Default image state
const getDefaultImageState = (): ImageState => ({
  localFiles: [],
  localProfileImageId: null,
  isUploading: false,
  uploadProgress: 0,
  uploadError: null
});

// Image validation
function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
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
  isProfile: boolean = false
): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const prefix = isProfile ? 'profile' : 'inspiration';
  const fileName = `${prefix}_${timestamp}_${randomString}.${fileExtension}`;
  
  const filePath = `projects/${userId}/${fileName}`;
  
  const uploadResult = await uploadFile(file, filePath);
  
  if (!uploadResult.success || !uploadResult.url) {
    throw new Error(uploadResult.error || 'Upload failed');
  }
  
  return uploadResult.url;
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

        set((state) => ({
          localFiles: [...state.localFiles, newImage],
          uploadError: null
        }), false, 'addLocalImage');
      },

      removeLocalImage: (id) => {
        set((state) => {
          const imageToRemove = state.localFiles.find(img => img.id === id);
          if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.previewUrl);
          }

          return {
            localFiles: state.localFiles.filter(img => img.id !== id),
            localProfileImageId: state.localProfileImageId === id ? null : state.localProfileImageId
          };
        }, false, 'removeLocalImage');
      },

      setProfileImage: (id) =>
        set({ localProfileImageId: id }, false, 'setProfileImage'),

      clearAllImages: () => {
        const { localFiles } = get();
        localFiles.forEach(img => URL.revokeObjectURL(img.previewUrl));
        
        set(getDefaultImageState(), false, 'clearAllImages');
      },

      uploadImages: async (userId) => {
        const { localFiles, localProfileImageId } = get();
        
        if (localFiles.length === 0) {
          return { images: [], profileImage: null };
        }

        set({ isUploading: true, uploadProgress: 0, uploadError: null }, false, 'uploadImages/start');

        try {
          const uploadPromises = localFiles.map(async (localFile, index) => {
            const isProfile = localFile.id === localProfileImageId;
            
            try {
              const url = await uploadSingleImage(localFile.file, userId, isProfile);
              
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

// Convenience hooks
// Stable selectors to prevent re-renders
const selectProjectImages = (state: ImageStoreState) => ({
  localFiles: state.localFiles,
  localProfileImageId: state.localProfileImageId,
  isUploading: state.isUploading,
  uploadProgress: state.uploadProgress,
  uploadError: state.uploadError
});

const selectImageActions = (state: ImageStoreState) => ({
  addLocalImage: state.addLocalImage,
  removeLocalImage: state.removeLocalImage,
  setProfileImage: state.setProfileImage,
  clearAllImages: state.clearAllImages,
  uploadImages: state.uploadImages,
  setUploadProgress: state.setUploadProgress,
  setUploadError: state.setUploadError,
  resetUploadState: state.resetUploadState
});

export function useProjectImages() {
  return useImageStore(selectProjectImages);
}

export function useImageActions() {
  return useImageStore(selectImageActions);
}