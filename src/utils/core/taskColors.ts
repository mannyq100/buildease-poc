/**
 * Centralized task colors and styling utilities for BuildEase
 * Single source of truth for all task status and priority colors
 * Ensures consistent UI across all components
 */

// Task Status Colors - Consistent background, text, and border colors
export const TASK_STATUS_COLORS = {
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
  BLOCKED: 'bg-red-100 text-red-800 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  // Fallback for unknown statuses
  DEFAULT: 'bg-gray-100 text-gray-800 border-gray-200'
} as const;

// Task Priority Colors - Consistent background, text, and border colors
export const TASK_PRIORITY_COLORS = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
  // Fallback for unknown priorities
  DEFAULT: 'bg-gray-100 text-gray-800 border-gray-200'
} as const;

// Icon colors for status indicators (circles, checkmarks, etc.)
export const TASK_STATUS_ICON_COLORS = {
  COMPLETED: 'text-green-600',
  IN_PROGRESS: 'text-blue-600',
  PENDING: 'text-orange-600',
  BLOCKED: 'text-red-600',
  CANCELLED: 'text-gray-500',
  DEFAULT: 'text-gray-500'
} as const;

// Badge variant mappings for shadcn-ui Badge component
export const TASK_PRIORITY_BADGE_VARIANTS = {
  URGENT: 'destructive',
  HIGH: 'destructive',
  MEDIUM: 'default',
  LOW: 'secondary',
  DEFAULT: 'secondary'
} as const;

export type TaskStatus = keyof typeof TASK_STATUS_COLORS;
export type TaskPriority = keyof typeof TASK_PRIORITY_COLORS;

/**
 * Get consistent status color classes for a task status
 * @param status Task status (case-insensitive)
 * @returns Tailwind CSS classes for background, text, and border
 */
export const getTaskStatusColor = (status: string): string => {
  const normalizedStatus = status?.toUpperCase().replace(/[-_\s]/g, '_') as TaskStatus;
  return TASK_STATUS_COLORS[normalizedStatus] || TASK_STATUS_COLORS.DEFAULT;
};

/**
 * Get consistent priority color classes for a task priority
 * @param priority Task priority (case-insensitive)
 * @returns Tailwind CSS classes for background, text, and border
 */
export const getTaskPriorityColor = (priority: string): string => {
  const normalizedPriority = priority?.toUpperCase() as TaskPriority;
  return TASK_PRIORITY_COLORS[normalizedPriority] || TASK_PRIORITY_COLORS.DEFAULT;
};

/**
 * Get icon color for task status indicators
 * @param status Task status (case-insensitive)
 * @returns Tailwind CSS text color class
 */
export const getTaskStatusIconColor = (status: string): string => {
  const normalizedStatus = status?.toUpperCase().replace(/[-_\s]/g, '_') as TaskStatus;
  return TASK_STATUS_ICON_COLORS[normalizedStatus] || TASK_STATUS_ICON_COLORS.DEFAULT;
};

/**
 * Get Badge variant for task priority
 * @param priority Task priority (case-insensitive)
 * @returns shadcn-ui Badge variant
 */
export const getTaskPriorityBadgeVariant = (priority: string): 'destructive' | 'default' | 'secondary' => {
  const normalizedPriority = priority?.toUpperCase() as TaskPriority;
  return TASK_PRIORITY_BADGE_VARIANTS[normalizedPriority] || TASK_PRIORITY_BADGE_VARIANTS.DEFAULT;
};

/**
 * Format task completion count consistently across the application
 * @param completed Number of completed tasks
 * @param total Total number of tasks
 * @returns Formatted string: "X/Y Tasks Done"
 */
export const formatTaskCount = (completed: number, total: number): string => {
  return `${completed}/${total} Tasks Done`;
};

/**
 * Format task completion count for shorter displays
 * @param completed Number of completed tasks
 * @param total Total number of tasks
 * @returns Formatted string: "X/Y"
 */
export const formatTaskCountShort = (completed: number, total: number): string => {
  return `${completed}/${total}`;
};

/**
 * Calculate completion percentage for progress indicators
 * @param completed Number of completed tasks
 * @param total Total number of tasks
 * @returns Progress percentage (0-100)
 */
export const calculateTaskProgress = (completed: number, total: number): number => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

/**
 * Legacy compatibility - maps old status names to new format
 */
export const STATUS_MAPPINGS = {
  // Common variations found in codebase
  'completed': 'COMPLETED',
  'in progress': 'IN_PROGRESS',
  'in-progress': 'IN_PROGRESS',
  'pending': 'PENDING',
  'not started': 'PENDING',
  'blocked': 'BLOCKED',
  'cancelled': 'CANCELLED',
  'canceled': 'CANCELLED'
} as const;

/**
 * Legacy compatibility - maps old priority names to new format
 */
export const PRIORITY_MAPPINGS = {
  'high': 'HIGH',
  'medium': 'MEDIUM',
  'low': 'LOW',
  'urgent': 'URGENT'
} as const;