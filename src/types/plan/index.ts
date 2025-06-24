/**
 * Plan Types Barrel Export
 * Centralized exports for all plan-related types
 */

// Base types
export * from './base';

// Entity types
export * from './task';
export * from './material';
export * from './phase';
export * from './construction';

// Utilities
export * from './conversions';
export * from './guards';
export * from './views';

// Import for re-export
import {
  convertPlanTaskToModal,
  convertModalTaskToPlan,
  convertPlanMaterialToModal,
  convertModalMaterialToPlan,
  convertPlanPhaseToModal,
  convertModalPhaseToPlan
} from './conversions';

import {
  isPlanTask,
  isModalTask,
  isPlanMaterial,
  isModalMaterial
} from './guards';

// Re-export for convenience
export const PlanTypeUtils = {
  // Conversion functions
  convertPlanTaskToModal,
  convertModalTaskToPlan,
  convertPlanMaterialToModal,
  convertModalMaterialToPlan,
  convertPlanPhaseToModal,
  convertModalPhaseToPlan,
  
  // Type guards
  isPlanTask,
  isModalTask,
  isPlanMaterial,
  isModalMaterial
};