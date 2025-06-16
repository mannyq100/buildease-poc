/**
 * Authentication utilities index
 * 
 * Central export point for all authentication and security utilities
 */

// Core security components
export { StorageAdapter, storageAdapter } from './StorageAdapter';
export { SecurityMonitor, securityMonitor } from './SecurityMonitor';

// Note: Core auth utilities moved to auth modules - no longer needed

// Types and interfaces
export interface AuthSecurityConfig {
  enableDeviceFingerprinting: boolean;
  enableActivityMonitoring: boolean;
  requireReAuthForFinancial: boolean;
  sessionTimeoutMinutes: number;
  maxInactiveMinutes: number;
}

export interface SecurityEventData {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// Utility functions for BuildEase-specific auth operations
export const authUtils = {
  /**
   * Check if operation requires re-authentication for construction workflows
   */
  requiresReAuth: (operation: string): boolean => {
    return require('./SecurityMonitor').securityMonitor.requiresReAuthentication(operation);
  },
  
  /**
   * Get current security status for dashboard display
   */
  getSecurityStatus: () => {
    return require('./SecurityMonitor').securityMonitor.getSecuritySummary();
  },
  
  /**
   * Audit localStorage for security status
   */
  auditStorageSecurity: (): {
    hasStoredSession: boolean;
    sessionAge: number | null;
    isValidFormat: boolean;
    storageMethod: string;
  } => {
    return require('./StorageAdapter').storageAdapter.auditStorageSecurity();
  },
};