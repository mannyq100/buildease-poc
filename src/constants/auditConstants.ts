/**
 * Shared constants for audit trail system
 * Centralized constants to avoid duplication and maintain consistency
 */

// Severity color mappings for consistent UI theming
export const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
} as const;

export const SEVERITY_INDICATOR_COLORS = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500', 
  critical: 'bg-red-500'
} as const;

// Action category icons for consistent UI
export const ACTION_ICONS = {
  'project.created': '🏗️',
  'project.updated': '✏️',
  'phase.created': '📋',
  'phase.completed': '✅',
  'task.created': '📝',
  'task.completed': '✅',
  'document.uploaded': '📁',
  'comment.created': '💬',
  'expense.created': '💰',
  'team.member_added': '👥',
  'auth.login': '🔐',
  'error.application': '⚠️'
} as const;

// Category icons for action categorization
export const CATEGORY_ICONS = {
  create: '+',
  read: '👁️',
  update: '✏️',
  delete: '🗑️',
  auth: '🔐',
  collaboration: '👥',
  system: '⚙️'
} as const;

// Time period configurations for reports and filtering
export const TIME_PERIODS = [
  { key: 'last7days', label: 'Last 7 Days', days: 7 },
  { key: 'last30days', label: 'Last 30 Days', days: 30 },
  { key: 'last90days', label: 'Last 90 Days', days: 90 },
  { key: 'thisMonth', label: 'This Month', isCurrentMonth: true },
  { key: 'lastMonth', label: 'Last Month', isLastMonth: true }
] as const;

// Risk score thresholds
export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 80,
  CRITICAL: 100
} as const;

// Data retention configuration
export const RETENTION_LIMITS = {
  MAX_SINGLE_LOAD: 1000, // Maximum records to load at once for UI performance
  BATCH_SIZE: 50, // Batch size for processing
  MAX_EXPORT: 100000, // Maximum records for export
  CLEANUP_BATCH: 10000 // Batch size for cleanup operations
} as const;

// Auto-refresh intervals (in seconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30,
  TIMELINE: 60,
  COMPLIANCE: 300 // 5 minutes
} as const;

// Compliance report templates
export const COMPLIANCE_TEMPLATES = [
  {
    id: 'osha-safety',
    name: 'OSHA Safety Compliance',
    description: 'Occupational Safety and Health Administration compliance report',
    requiredFields: ['safety_incidents', 'training_records', 'equipment_inspections'],
    format: 'pdf' as const,
    regulatoryStandard: 'OSHA'
  },
  {
    id: 'soc2-security', 
    name: 'SOC 2 Security Audit',
    description: 'System and Organization Controls 2 security audit report',
    requiredFields: ['access_controls', 'data_handling', 'security_incidents'],
    format: 'pdf' as const,
    regulatoryStandard: 'SOC 2'
  },
  {
    id: 'gdpr-privacy',
    name: 'GDPR Privacy Compliance', 
    description: 'General Data Protection Regulation compliance report',
    requiredFields: ['data_access', 'data_processing', 'consent_management'],
    format: 'json' as const,
    regulatoryStandard: 'GDPR'
  },
  {
    id: 'iso-quality',
    name: 'ISO 9001 Quality Management',
    description: 'ISO 9001 quality management system audit report', 
    requiredFields: ['process_controls', 'quality_metrics', 'corrective_actions'],
    format: 'csv' as const,
    regulatoryStandard: 'ISO 9001'
  },
  {
    id: 'custom-audit',
    name: 'Custom Audit Report',
    description: 'Customizable audit report for specific requirements',
    requiredFields: [],
    format: 'csv' as const
  }
] as const;

// Default retention policies
export const DEFAULT_RETENTION_POLICIES = [
  {
    id: 'standard',
    name: 'Standard Retention',
    description: 'General business records retention for 7 years',
    retentionDays: 2555, // 7 years
    autoCleanup: false,
    applyToCategories: ['create', 'read', 'update'],
    preserveCompliance: true,
    enabled: true
  },
  {
    id: 'security-logs',
    name: 'Security Logs', 
    description: 'Security and authentication logs for 3 years',
    retentionDays: 1095, // 3 years
    autoCleanup: true,
    complianceStandard: 'SOC 2',
    applyToCategories: ['auth', 'system'],
    preserveCompliance: true,
    enabled: true
  },
  {
    id: 'gdpr-compliance',
    name: 'GDPR Compliance',
    description: 'Personal data processing logs for 6 years', 
    retentionDays: 2190, // 6 years
    autoCleanup: false,
    complianceStandard: 'GDPR',
    applyToCategories: ['delete', 'collaboration'],
    preserveCompliance: true,
    enabled: true
  },
  {
    id: 'temp-logs',
    name: 'Temporary Logs',
    description: 'Short-term activity logs for 90 days',
    retentionDays: 90,
    autoCleanup: true, 
    applyToCategories: ['read'],
    preserveCompliance: false,
    enabled: false
  }
] as const;

// Export type definitions for consistency
export type SeverityLevel = keyof typeof SEVERITY_COLORS;
export type ActionCategory = keyof typeof CATEGORY_ICONS;
export type TimePeriodKey = typeof TIME_PERIODS[number]['key'];
export type ComplianceTemplateId = typeof COMPLIANCE_TEMPLATES[number]['id'];
export type RetentionPolicyId = typeof DEFAULT_RETENTION_POLICIES[number]['id'];