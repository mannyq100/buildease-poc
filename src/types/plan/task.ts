/**
 * Task Type Definitions
 * Task interfaces for plan and modal contexts
 */

import { BaseTask } from './base';

/**
 * Plan Task Interface
 * Used in plan data and state management
 */
export interface PlanTask extends BaseTask {
  duration: string; // String format: "1 week", "3 days"
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
}

/**
 * Modal Task Interface
 * Used in modal forms and UI components
 */
export interface ModalTask extends BaseTask {
  duration?: number; // Number format for form inputs
  startDate: string; // Required for forms
  endDate: string; // Required for forms
}

// Legacy compatibility
export type Task = PlanTask;