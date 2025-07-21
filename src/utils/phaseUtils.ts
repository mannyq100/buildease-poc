/**
 * Phase Utility Functions
 * Helper functions for working with flexible phase categories and tasks
 */

import { CONSTRUCTION_PHASES_WITH_TASKS } from '../data/constants/constructionPhasesWithTasks';
import type { 
  ProjectType, 
  PhaseTemplate, 
  TaskTemplate, 
  ConstructionPhase 
} from '../types/constructionPhases';

// Re-export types for convenience
export type { ProjectType, PhaseTemplate, TaskTemplate };

/**
 * Get available phase templates based on project type
 */
export function getPhaseTemplatesForProjectType(projectType: ProjectType): PhaseTemplate[] {
  const allPhases = Object.entries(CONSTRUCTION_PHASES_WITH_TASKS);
  
  let filteredPhases: [string, any][];
  
  if (projectType === 'new_construction') {
    filteredPhases = allPhases.filter(([key, phase]) => !phase.isRemodelingPhase);
  } else if (projectType === 'remodeling') {
    // Include demolition and modification phases for remodeling
    filteredPhases = allPhases.filter(([key, phase]) => {
      const corePhases = ['PRE_CONSTRUCTION', 'MEP_ROUGH_IN', 'INTERIOR_CONSTRUCTION', 
                         'INTERIOR_FINISHES', 'FIXTURES_AND_FITTINGS', 'TESTING_AND_COMMISSIONING', 
                         'PROJECT_COMPLETION'];
      return phase.isRemodelingPhase || corePhases.includes(key);
    });
  } else {
    filteredPhases = allPhases; // Return all for 'both' or unspecified
  }
  
  return filteredPhases.map(([key, phase]) => ({
    id: key,
    name: phase.alternativeNames[0] || key.replace(/_/g, ' '),
    description: phase.description,
    category: key,
    alternativeNames: phase.alternativeNames,
    isRemodelingPhase: phase.isRemodelingPhase,
    tasks: phase.tasks.map((task: any) => ({
      id: task.id,
      name: task.name,
      alternativeNames: task.alternativeNames
    }))
  }));
}

/**
 * Get phase template by category
 */
export function getPhaseTemplateByCategory(category: string): PhaseTemplate | null {
  const phaseData = CONSTRUCTION_PHASES_WITH_TASKS[category as PhaseCategory];
  if (!phaseData) return null;
  
  return {
    id: category,
    name: phaseData.alternativeNames[0] || category.replace(/_/g, ' '),
    description: phaseData.description,
    category,
    alternativeNames: phaseData.alternativeNames,
    isRemodelingPhase: phaseData.isRemodelingPhase,
    tasks: phaseData.tasks.map((task: any) => ({
      id: task.id,
      name: task.name,
      alternativeNames: task.alternativeNames
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
 * Search phase templates by name or alternative names
 */
export function searchPhaseTemplates(query: string, projectType?: ProjectType): PhaseTemplate[] {
  const phases = projectType ? getPhaseTemplatesForProjectType(projectType) : 
                 getPhaseTemplatesForProjectType('both');
  
  const searchTerm = query.toLowerCase();
  
  return phases.filter(phase => 
    phase.name.toLowerCase().includes(searchTerm) ||
    phase.description.toLowerCase().includes(searchTerm) ||
    phase.alternativeNames.some(name => name.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get phase display name (first alternative name or formatted category)
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
    newConstruction: getPhaseTemplatesForProjectType('new_construction').map(p => p.category),
    remodeling: getPhaseTemplatesForProjectType('remodeling').map(p => p.category),
    all: getAllPhaseCategories()
  };
}
