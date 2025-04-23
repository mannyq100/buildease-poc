/**
 * User and permission types for the application
 * Based on BuildEase API schema
 */

// User provider types
export type AuthProvider = 'GOOGLE' | 'APPLE' | 'EMAIL' | 'GITHUB' | 'AUTH0' | 'FACEBOOK';

// User status types
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

// User tier types
export type UserTier = 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

// Project permission types
export type ProjectPermission = 
  | 'VIEW_NON_FINANCIAL'
  | 'VIEW_FINANCIAL'
  | 'EDIT'
  | 'MANAGE_TEAM'
  | 'ADMIN';

// User notification settings
export interface NotificationSettings {
  email: boolean;
  push: boolean;
}

// User settings
export interface UserSettings {
  pictureUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  notifications: NotificationSettings;
  language: string;
  currency: string;
}

// Project permissions map (project ID to permissions array)
export type ProjectPermissionsMap = Record<string, ProjectPermission[]>;

// User role types for RBAC
export type UserRole = 'admin' | 'owner' | 'manager' | 'contractor' | 'worker' | 'client';

// Permission scopes for RBAC
export type PermissionScope =
  | 'projects:read' | 'projects:write' | 'projects:delete'
  | 'team:read' | 'team:write' | 'team:delete'
  | 'expenses:read' | 'expenses:write' | 'expenses:approve'
  | 'documents:read' | 'documents:write' | 'documents:delete'
  | 'materials:read' | 'materials:write' | 'materials:approve'
  | 'schedule:read' | 'schedule:write'
  | 'messages:read' | 'messages:write'
  | 'users:read' | 'users:write' | 'users:delete';

// User profile information from API
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  provider: AuthProvider;
  tier: UserTier;
  status: UserStatus;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  permissions: PermissionScope[];
  projectPermissions: ProjectPermissionsMap;
}

// Payload used for registering or fully updating a user profile
export interface RegisterUserPayload {
  id?: string; // Optional: Used by backend during update to find user if needed, but usually identified by token
  email: string;
  name: string;
  phone?: string;
  provider: AuthProvider;
  providerIdentifier: string; // Required from Auth0 user info
  tier: UserTier; // Often set by backend logic, but might be needed
  status: UserStatus; // Often set by backend logic
  settings: UserSettings;
  notifications: NotificationSettings; // Duplicated inside settings, but often expected at top-level by backend
}

// Complete user state including profile
export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

// Helper function to check if a user has a specific permission for a project
export function hasProjectPermission(
  profile: UserProfile | null,
  projectId: string,
  permission: ProjectPermission
): boolean {
  if (!profile || !profile.projectPermissions) return false;
  
  const projectPerms = profile.projectPermissions[projectId];
  if (!projectPerms) return false;
  
  return projectPerms.includes(permission);
}
