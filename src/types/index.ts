/**
 * Types Barrel Export
 * Central export point for all application types
 * Following BuildEase conventions for type organization
 */

// Plan-related types
export * from './plan/index';

// Other domain types
export * from './project';
export * from './projectDetails';
export * from './task';
export * from './material';
export * from './phase';
export * from './team';
export * from './budget';
export * from './user';
export * from './dashboard';
export * from './schedule';
export * from './documents';
export * from './ai';

// Domain-specific exports
export * from './materials';
export * from './projectInputs';

// Re-export plan types for convenience
export {
  type PlanTask,
  type ModalTask,
  type PlanMaterial,
  type ModalMaterial,
  type PlanPhase,
  type ModalPhase,
  type ConstructionPlan,
  type Budget,
  type TeamMember,
  type Document,
  PlanTypeUtils
} from './plan/index';