/**
 * User profile and permissions service
 * Integrates with BuildEase backend API
 */
import { apiRequest } from '@/lib/api-client';
import { AuthProvider, UserProfile, UserSettings, UserTier, UserStatus, NotificationSettings, ProjectPermission } from '@/types/user';

// BuildEase API endpoints
const API_ENDPOINTS = {
  CURRENT_USER: '/api/v1/user/me',
  REGISTER_USER: '/api/v1/user/register',
  USER_UPDATE: '/api/v1/user/update' // Endpoint for full user profile update
};

/**
 * Payload for registering or updating a user
 */
export interface RegisterUserPayload {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  provider: AuthProvider;
  providerIdentifier: string;
  tier: UserTier;
  status: UserStatus;
  settings?: UserSettings;
  notifications?: NotificationSettings;
}

/**
 * Update the full user profile using a payload similar to registration.
 * Assumes the backend identifies the user via the authentication token.
 */
export async function updateUserFullProfile(data: RegisterUserPayload): Promise<UserProfile> {
  // Check if we have a profile picture in the payload
  const hasProfilePicture = data.settings?.pictureUrl && data.settings.pictureUrl.length > 0;
  
  // Create a copy of the data to avoid mutating the original
  const payload = { ...data };
  
  // Log the update operation (without the image data to keep logs clean)
  console.log('Updating user profile:', { 
    ...payload, 
    settings: payload.settings ? { ...payload.settings, pictureUrl: hasProfilePicture ? '[IMAGE DATA]' : undefined } : undefined 
  });
  
  // Use POST method as we are sending potentially large image data
  return apiRequest<UserProfile>(API_ENDPOINTS.USER_UPDATE, {
    method: 'POST', 
    body: payload,
    includeAuth: true
  });
}

/**
 * Register or update user based on ID token claims
 */
export async function registerUser(data: RegisterUserPayload): Promise<UserProfile> {
  return apiRequest<UserProfile>(API_ENDPOINTS.REGISTER_USER, {
    method: 'POST',
    body: data,
    includeAuth: true
  });
}

/**
 * Check if the current user has a specific permission for a project
 */
export function hasProjectPermission(
  user: UserProfile | null, 
  projectId: string, 
  permission: ProjectPermission
): boolean {
  if (!user || !user.projectPermissions) return false;
  
  const projectPerms = user.projectPermissions[projectId];
  if (!projectPerms) return false;
  
  return projectPerms.includes(permission);
}

/**
 * Check if the current user has any of the specified permissions for a project
 */
export function hasAnyProjectPermission(
  user: UserProfile | null, 
  projectId: string, 
  permissions: ProjectPermission[]
): boolean {
  if (!user || !user.projectPermissions) return false;
  
  const projectPerms = user.projectPermissions[projectId];
  if (!projectPerms) return false;
  
  return permissions.some(permission => projectPerms.includes(permission));
}

/**
 * Check if the current user has admin permission for any project
 */
export function isAdminForAnyProject(user: UserProfile | null): boolean {
  if (!user || !user.projectPermissions) return false;
  
  return Object.values(user.projectPermissions).some(perms => 
    perms.includes('ADMIN')
  );
}

/**
 * Get list of projects where user has at least the specified permission
 */
export function getProjectsWithPermission(
  user: UserProfile | null, 
  permission: ProjectPermission
): string[] {
  if (!user || !user.projectPermissions) return [];
  
  return Object.entries(user.projectPermissions)
    .filter(([_, perms]) => perms.includes(permission))
    .map(([projectId]) => projectId);
}

/**
 * Get the user's display name
 */
export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return '';
  return user.name || user.email.split('@')[0];
}
