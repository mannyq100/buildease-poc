/**
 * Project image utility functions
 * Provides helper functions for handling project images consistently across the application
 */

/**
 * Default project image to use when no profile image is available
 * This is a placeholder image URL that can be replaced with an actual default image
 */
export const DEFAULT_PROJECT_IMAGE = '/images/default-project.jpg';

/**
 * Get the display image URL for a project
 * Returns the profile image if available, otherwise returns the default image
 * 
 * @param profileImage - The project's profile image URL
 * @returns The URL to use for displaying the project image
 */
export function getProjectDisplayImage(profileImage?: string | null): string {
  return profileImage || DEFAULT_PROJECT_IMAGE;
}

/**
 * Get a list of inspiration image URLs from a project
 * 
 * @param project - The project object containing images array
 * @returns Array of image URLs or empty array if none available
 */
export function getProjectInspirationImages(project: { images?: string[] }): string[] {
  return project.images || [];
}

/**
 * Check if a project has inspiration images
 * 
 * @param project - The project object containing images array
 * @returns True if the project has at least one inspiration image
 */
export function hasInspirationImages(project: { images?: string[] }): boolean {
  return Boolean(project.images && project.images.length > 0);
}

/**
 * Format the storage bucket URL for project inspiration images
 * 
 * @param userId - The user ID who owns the project
 * @param filename - The filename of the image
 * @returns The full path for the image in the storage bucket
 */
export function formatProjectInspirationPath(userId: string, filename: string): string {
  return `${userId}/${filename}`;
}

/**
 * Extract the filename from a project inspiration image URL
 * 
 * @param url - The full URL of the image
 * @returns The filename portion of the URL
 */
export function getFilenameFromInspirationUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch {
    console.error('Invalid URL:', url);
    return null;
  }
}
