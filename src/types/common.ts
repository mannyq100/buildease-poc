/**
 * Common shared types across the application
 * This file centralizes common type definitions to ensure consistency
 */

// Common view mode types
export type ViewMode = 'grid' | 'list';
export type TaskViewLayout = 'grid' | 'list';
export type CalendarViewMode = 'month' | 'week' | 'day';

// Common status types 
export type StatusType = 'completed' | 'in-progress' | 'pending' | 'delayed' | 'cancelled' | 'warning' | 'success';
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'upcoming' | 'on-hold';
export type TaskStatus = 'completed' | 'in-progress' | 'not-started' | 'delayed';
export type AvailabilityStatus = 'available' | 'busy' | 'on-leave' | 'offline';
export type MaterialStatus = 'ordered' | 'delivered' | 'pending' | 'backorder';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// Common badge variant types
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

// Common API response patterns
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
  message?: string;
}

// Common error types
export interface AppError {
  code?: string;
  message: string;
  details?: string;
  timestamp: string;
}

// Common loading state interface
export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
}

// Common form field validation interface
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// Common pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Common sorting options
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Common filtering pattern
export interface FilterOption<T = string> {
  field: string;
  value: T;
  operator?: 'equals' | 'contains' | 'greater' | 'less' | 'between';
}

// Common date range
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

// Common component base props
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

// Common theme interface
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
} 