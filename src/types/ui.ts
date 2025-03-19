/**
 * UI-related type definitions
 * Shared types and interfaces for UI components
 */

import { ReactNode } from 'react';

/**
 * General-purpose empty state component props
 */
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  iconType?: 'calendar' | 'list' | 'document' | 'users' | 'chart' | 'settings' | 'inbox';
}

/**
 * Color configuration for UI elements
 */
export interface ColorConfig {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  ring?: string;
  shadow?: string;
  hoverBg?: string;
}

/**
 * Stat card component props pattern
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  description?: string;
  change?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Common page header props
 */
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

/**
 * Dashboard card props
 */
export type CardVariant = 'metric' | 'action' | 'chart' | 'status';
export type CardAccent = 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo' | 'none';

export interface DashboardCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  variant?: CardVariant;
  accent?: CardAccent;
  className?: string;
  footer?: ReactNode;
  action?: ReactNode;
}

/**
 * Status types for various components
 */
export type StatusType = 'completed' | 'in-progress' | 'pending' | 'delayed' | 'cancelled' | 'warning' | 'success';

/**
 * Navigation item structure
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
  badge?: string | number;
  children?: NavItem[];
}