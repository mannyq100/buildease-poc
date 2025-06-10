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

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  projectUpdates: boolean;
  taskAssignments: boolean;
  phaseCompletions: boolean;
  teamMessages: boolean;
}

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