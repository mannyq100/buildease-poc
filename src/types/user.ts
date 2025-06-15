/**
 * User and permission types for the application
 * Based on BuildEase API schema
 */

// User provider types - aligned with Supabase and database capabilities
export type AuthProvider = 'GOOGLE' | 'FACEBOOK' | 'EMAIL' | 'GITHUB' | 'APPLE';

// User status types - aligned with database schema
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// User tier types - aligned with database schema including FREE tier
export type UserTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

// Project permission types
export type ProjectPermission = 
  | 'VIEW_NON_FINANCIAL'
  | 'VIEW_FINANCIAL'
  | 'EDIT'
  | 'MANAGE_TEAM'
  | 'ADMIN';

// Database user roles (from construction_mgr schema)
export type DatabaseUserRole = 'OWNER' | 'CONTRACTOR' | 'ARCHITECT' | 'ENGINEER' | 'SUPPLIER' | 'INSPECTOR';

// Application-level user roles for frontend logic and component access control
export type AppUserRole = 'admin' | 'owner' | 'manager' | 'contractor' | 'worker' | 'client';

// Main user role type for frontend components (keep app-level roles for UI logic)
export type UserRole = AppUserRole;

// Define Permission type based on construction_mgr.permission_type enum
export type Permission = string; 

export interface ProjectMembership {
  projectId: string;
  projectName: string;
  role: UserRole;
  permissions: Permission[];
}

// User notification settings
export interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  projectUpdates?: boolean;
  taskAssignments?: boolean;
  phaseCompletions?: boolean;
  teamMessages?: boolean;
}

// User settings - Merged from both files
export interface UserSettings {
  picture_url?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  notifications?: NotificationSettings;
  language?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
}

// Permission scopes for RBAC - may be deprecated
export type PermissionScope =
  | 'projects:read' | 'projects:write' | 'projects:delete'
  | 'team:read' | 'team:write' | 'team:delete'
  | 'expenses:read' | 'expenses:write' | 'expenses:approve'
  | 'documents:read' | 'documents:write' | 'documents:delete'
  | 'materials:read' | 'materials:write' | 'materials:approve'
  | 'schedule:read' | 'schedule:write'
  | 'messages:read' | 'messages:write'
  | 'users:read' | 'users:write' | 'users:delete';

// Project permissions map (project ID to permissions array) - may be deprecated
export type ProjectPermissionsMap = Record<string, ProjectPermission[]>;

// User profile information from API
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  provider: AuthProvider;
  tier: UserTier;
  status: UserStatus;
  settings?: UserSettings;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  avatarUrl?: string; // This will be derived from settings.picture_url
  projectMemberships: ProjectMembership[]; // Updated structure
  
  // Deprecated properties, kept for transition.
  permissions?: PermissionScope[];
  projectPermissions?: ProjectPermissionsMap;
}

// Payload used for registering or fully updating a user profile
export interface RegisterUserPayload {
  id?: string; // Optional: Used by backend during update to find user if needed, but usually identified by token
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  provider: AuthProvider;
  providerIdentifier: string; // Provider-specific identifier
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
  if (!profile || !profile.projectMemberships) return false;
  
  const membership = profile.projectMemberships.find(m => m.projectId === projectId);
  if (!membership) return false;
  
  // The permissions in projectMemberships are strings. We assume they match ProjectPermission values.
  return membership.permissions.includes(permission);
}
