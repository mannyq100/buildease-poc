/**
 * Authentication types for Buildease
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  avatar?: string;
  phoneNumber?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  socialProfiles?: SocialProfiles;
}

export type UserRole = 'owner' | 'manager' | 'contractor' | 'worker' | 'client';

export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple';

export interface SocialProfiles {
  google?: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };
  facebook?: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };
  apple?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  providerToken?: string;
}

export interface SocialAuthCallback {
  provider: AuthProvider;
  code: string;
  state?: string;
} 