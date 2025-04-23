/**
 * Mock user profile data for development and testing
 */
import { UserProfile, UserSettings, UserRole, PermissionScope } from '@/types/user';

// Define role-based permissions for RBAC
const rolePermissions: Record<UserRole, PermissionScope[]> = {
  admin: [
    'projects:read', 'projects:write', 'projects:delete',
    'team:read', 'team:write', 'team:delete',
    'expenses:read', 'expenses:write', 'expenses:approve',
    'documents:read', 'documents:write', 'documents:delete',
    'materials:read', 'materials:write', 'materials:approve',
    'schedule:read', 'schedule:write',
    'messages:read', 'messages:write',
    'users:read', 'users:write', 'users:delete'
  ],
  owner: [
    'projects:read', 'projects:write', 'projects:delete',
    'team:read', 'team:write', 'team:delete',
    'expenses:read', 'expenses:write', 'expenses:approve',
    'documents:read', 'documents:write', 'documents:delete',
    'materials:read', 'materials:write', 'materials:approve',
    'schedule:read', 'schedule:write',
    'messages:read', 'messages:write',
    'users:read', 'users:write'
  ],
  manager: [
    'projects:read', 'projects:write',
    'team:read', 'team:write',
    'expenses:read', 'expenses:write', 'expenses:approve',
    'documents:read', 'documents:write',
    'materials:read', 'materials:write', 'materials:approve',
    'schedule:read', 'schedule:write',
    'messages:read', 'messages:write',
    'users:read'
  ],
  contractor: [
    'projects:read',
    'team:read',
    'expenses:read', 'expenses:write',
    'documents:read', 'documents:write',
    'materials:read', 'materials:write',
    'schedule:read',
    'messages:read', 'messages:write'
  ],
  worker: [
    'projects:read',
    'team:read',
    'documents:read',
    'materials:read',
    'schedule:read',
    'messages:read', 'messages:write'
  ],
  client: [
    'projects:read',
    'documents:read',
    'schedule:read',
    'messages:read', 'messages:write'
  ]
};

// Mock user profiles based on Auth0 email
export const mockUserProfiles: Record<string, UserProfile> = {
  'john.doe@example.com': {
    id: 'usr_123456789',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'owner',
    company: 'Doe Construction',
    avatar: '/avatars/john-doe.jpg',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Project Owner',
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2025-03-20T14:45:00Z',
    lastLogin: '2025-04-19T01:30:00Z',
    isActive: true,
    permissions: rolePermissions.owner
  },
  'sarah.manager@example.com': {
    id: 'usr_987654321',
    email: 'sarah.manager@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'manager',
    company: 'Doe Construction',
    avatar: '/avatars/sarah-johnson.jpg',
    phone: '+1 (555) 987-6543',
    jobTitle: 'Project Manager',
    createdAt: '2023-02-10T10:15:00Z',
    updatedAt: '2025-03-18T11:30:00Z',
    lastLogin: '2025-04-18T09:45:00Z',
    isActive: true,
    permissions: rolePermissions.manager
  },
  'mike.contractor@example.com': {
    id: 'usr_456789123',
    email: 'mike.contractor@example.com',
    firstName: 'Mike',
    lastName: 'Smith',
    role: 'contractor',
    company: 'Smith Electrical',
    avatar: '/avatars/mike-smith.jpg',
    phone: '+1 (555) 456-7890',
    jobTitle: 'Electrical Contractor',
    createdAt: '2023-03-05T14:20:00Z',
    updatedAt: '2025-02-28T16:10:00Z',
    lastLogin: '2025-04-17T13:20:00Z',
    isActive: true,
    permissions: rolePermissions.contractor
  },
  'default': {
    id: 'usr_default',
    email: 'user@example.com',
    firstName: 'Default',
    lastName: 'User',
    role: 'owner',
    company: 'BuildEase Construction',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    permissions: rolePermissions.owner
  }
};

// Default user settings
export const defaultUserSettings: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  language: 'en',
  timezone: 'America/New_York'
};

// Get mock user profile based on email
export function getMockUserProfile(email: string): UserProfile {
  return mockUserProfiles[email] || mockUserProfiles.default;
}

// Get mock user settings
export function getMockUserSettings(): UserSettings {
  return defaultUserSettings;
}
