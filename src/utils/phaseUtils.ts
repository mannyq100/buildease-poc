/**
 * Phase Utility Functions
 * Helper functions for working with flexible phase categories and tasks
 */

import { CONSTRUCTION_PHASES_WITH_TASKS, getPhasesForProjectType } from '../data/constants/constructionPhasesWithTasks';
import type { ProjectType, PhaseTemplate as ImportedPhaseTemplate } from '../data/constants/constructionPhasesWithTasks';

// Define our own PhaseTemplate interface that matches our cleaned data structure
export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isRemodelingPhase?: boolean;
  tasks: TaskTemplate[];
}

export interface TaskTemplate {
  id: string;
  name: string;
}

// Re-export types for convenience
export type { ProjectType };

/**
 * Get available phase templates based on project type
 */
export function getPhaseTemplatesForProjectType(projectType: ProjectType): PhaseTemplate[] {
  // Use the helper function from constructionPhasesWithTasks.ts
  const filteredPhases = getPhasesForProjectType(projectType);
  
  return filteredPhases.map(([key, phase]) => ({
    id: key,
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: phase.description,
    category: key,
    isRemodelingPhase: phase.isRemodelingPhase,
    tasks: phase.tasks.map(task => ({
      id: task.id,
      name: task.name
    }))
  }));
}

/**
 * Get phase template by category
 */
export function getPhaseTemplateByCategory(category: string): PhaseTemplate | null {
  const phaseData = CONSTRUCTION_PHASES_WITH_TASKS[category as keyof typeof CONSTRUCTION_PHASES_WITH_TASKS];
  if (!phaseData) return null;
  
  return {
    id: category,
    name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: phaseData.description,
    category,
    isRemodelingPhase: phaseData.isRemodelingPhase,
    tasks: phaseData.tasks.map(task => ({
      id: task.id,
      name: task.name
    }))
  };
}

/**
 * Get default tasks for a phase category
 */
export function getDefaultTasksForPhase(category: string): TaskTemplate[] {
  const phaseTemplate = getPhaseTemplateByCategory(category);
  return phaseTemplate?.tasks || [];
}

/**
 * Search phase templates by name or description
 */
export function searchPhaseTemplates(query: string, projectType?: ProjectType): PhaseTemplate[] {
  const phases = projectType ? getPhaseTemplatesForProjectType(projectType) : 
                 getPhaseTemplatesForProjectType('residential-single'); // Default to residential-single instead of 'both'
  
  const searchTerm = query.toLowerCase();
  
  return phases.filter(phase => 
    phase.name.toLowerCase().includes(searchTerm) ||
    phase.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get phase display name (formatted category)
 */
export function getPhaseDisplayName(category: string): string {
  const phaseTemplate = getPhaseTemplateByCategory(category);
  return phaseTemplate?.name || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Validate if a category exists in the templates
 */
export function isValidPhaseCategory(category: string): boolean {
  return category in CONSTRUCTION_PHASES_WITH_TASKS;
}

/**
 * Get all available phase categories
 */
export function getAllPhaseCategories(): string[] {
  return Object.keys(CONSTRUCTION_PHASES_WITH_TASKS);
}

/**
 * Get phase categories grouped by project type
 */
export function getPhaseCategories() {
  return {
    residentialSingle: getPhaseTemplatesForProjectType('residential-single').map(p => p.category),
    residentialMulti: getPhaseTemplatesForProjectType('residential-multi').map(p => p.category),
    commercial: getPhaseTemplatesForProjectType('commercial').map(p => p.category),
    renovation: getPhaseTemplatesForProjectType('renovation').map(p => p.category),
    all: getAllPhaseCategories()
  };
}
