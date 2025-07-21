/**
 * Types for Construction Phases and Tasks
 */

export interface ConstructionTask {
  id: string;
  name: string;
  alternativeNames: string[];
}

export interface ConstructionPhase {
  alternativeNames: string[];
  description: string;
  tasks: ConstructionTask[];
  isRemodelingPhase?: boolean;
}

export type ConstructionPhasesData = Record<string, ConstructionPhase>;

export type ProjectType = 'new_construction' | 'remodeling' | 'both';
export type PhaseCategory = string; // Now flexible instead of enum

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  alternativeNames: string[];
  isRemodelingPhase?: boolean;
  tasks: TaskTemplate[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  alternativeNames: string[];
}
