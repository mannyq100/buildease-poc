/**
 * Phase Type Definitions
 * Phase interfaces for plan and modal contexts
 */

import { BasePhase } from './base';
import { PlanTask } from './task';
import { PlanMaterial } from './material';

/**
 * Plan Phase Interface
 * Used in plan data and state management
 */
export interface PlanPhase extends BasePhase {
  duration: string; // String format: "4-6 weeks"
  startDate?: string;
  endDate?: string;
  tasks: PlanTask[];
  materials: PlanMaterial[];
}

/**
 * Modal Phase Interface
 * Used in modal forms and UI components
 */
export interface ModalPhase extends BasePhase {
  startDate: string; // Required for forms
  endDate: string; // Required for forms
  actualStart?: string | null; // Optional manual actual start date
  actualEnd?: string | null;   // Optional manual actual end date
  tasks?: unknown[]; // Flexible for modal context
  materials?: unknown[]; // Flexible for modal context
}

// Legacy compatibility
export type Phase = PlanPhase;