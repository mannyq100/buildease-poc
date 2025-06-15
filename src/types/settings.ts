/**
 * Settings types and interfaces
 */

export interface SettingsFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  pictureUrl: string;
}

export interface ProfileUploadState {
  uploadProgress: number;
  showProgress: boolean;
  isUpdating: boolean;
}

// NotificationSettings moved to @/types/user to avoid duplication
// Import with: import type { NotificationSettings } from '@/types/user';

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  smsAuthEnabled: boolean;
}

export interface SettingsTabProps {
  className?: string;
}

export type SettingsTab = 'account' | 'notifications' | 'appearance' | 'security';