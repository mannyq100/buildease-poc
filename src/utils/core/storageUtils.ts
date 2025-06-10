/**
 * Storage utilities for consistent user ID handling
 */
import { supabase } from '@/lib/supabase';

/**
 * Get the authenticated user ID for storage operations
 * This ensures consistency with the storage RLS policies
 */
export const getStorageUserId = async (): Promise<string | null> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error in getStorageUserId:', error);
    return null;
  }
};

/**
 * Upload a profile picture to Supabase storage
 * @param file The image file to upload
 * @param userId Optional user ID (defaults to current user)
 * @returns Object with success status and URL or error
 */
export const uploadProfilePicture = async (file: File, userId?: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Get user ID if not provided
    const storageUserId = userId || await getStorageUserId();
    
    if (!storageUserId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' };
    }
    
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExt}`;
    
    // Create the proper path structure with userId as folder
    // This is critical for RLS policies that check storage.foldername(name)[1] = auth.uid()
    const filePath = `${storageUserId}/${fileName}`;
    
    console.log(`Uploading to path: ${filePath} in profiles bucket`);
    
    // Upload to profiles bucket
    const { error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Profile picture upload error:', error);
      return { success: false, error: error.message };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: 'Failed to upload profile picture' };
  }
};
