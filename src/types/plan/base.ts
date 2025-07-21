/**
 * Base Plan Types
 * Core interfaces shared between modal and plan contexts
 */

// === Base Entity Types ===

/**
 * Base Task Interface
 * Common properties shared between modal and plan contexts
 */
export interface BaseTask {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'on-hold' | 'not-started';
  assignedTo?: string;
  progress: number;
  phaseId?: string;
}

/**
 * Base Material Interface
 * Common properties shared between modal and plan contexts
 */
export interface BaseMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status?: string;
  phaseId?: string;
}

/**
 * Base Phase Interface
 * Common properties shared between modal and plan contexts
 */
export interface BasePhase {
  id: string;
  name: string;
  description?: string;
  category: string; // Flexible category field (was enum, now string)
  order: number;
  status: 'pending' | 'planning' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
  progress: number;
}