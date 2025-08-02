/**
 * Enhanced Phase Utilities
 * Context-aware phase and task management based on project characteristics
 */

import { CONSTRUCTION_PHASES_WITH_TASKS } from '@/data/constants/constructionPhasesWithTasks';

// Basic task interface
interface BaseTask {
  id: string;
  name: string;
  description: string;
}

// Enhanced types for context-aware phase management
export interface ProjectContext {
  projectType: 'residential-single' | 'residential-multi' | 'commercial' | 'renovation';
  buildingSize: number;
  buildingSizeUnit: 'sq-m' | 'sq-ft';
  storeys: number;
  bedrooms: number;
  bathrooms: number;
  kitchens?: number;
  livingAreas?: number;
  buildingStyle?: string;
}

export interface EnhancedTask {
  id: string;
  name: string;
  alternativeNames?: string[];
  priority: 'critical' | 'important' | 'optional';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedDays: number;
  isRecommended: boolean;
  skillLevel: 'basic' | 'intermediate' | 'professional';
  inspectionRequired: boolean;
  dependencies?: string[];
  applicableProjectTypes?: string[];
  minBuildingSize?: number;
  maxStoreys?: number;
}

export interface EnhancedPhase {
  id: string;
  name: string;
  alternativeNames: string[];
  description: string;
  priority: 'critical' | 'important' | 'optional';
  estimatedWeeks: number;
  isRecommended: boolean;
  tasks: EnhancedTask[];
  stageGroup: 'planning' | 'ground' | 'structure' | 'envelope' | 'systems' | 'finishes' | 'completion';
  applicableProjectTypes: string[];
  dependencies?: string[];
}

export type ProjectScale = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

export interface PhaseGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: string[];
  estimatedDuration: string;
  color: string;
  isRecommended: boolean;
}

// Project scale classification
export const getProjectScale = (project: ProjectContext): ProjectScale => {
  const sizeInSqM = project.buildingSizeUnit === 'sq-ft' 
    ? project.buildingSize * 0.092903 
    : project.buildingSize;
  
  const { storeys, bedrooms } = project;
  
  if (sizeInSqM < 100 || (bedrooms <= 2 && storeys === 1)) return 'SMALL';
  if (sizeInSqM < 300 || (bedrooms <= 4 && storeys <= 2)) return 'MEDIUM';
  if (sizeInSqM < 500 || (bedrooms <= 6 && storeys <= 3)) return 'LARGE';
  return 'EXTRA_LARGE';
};

// Phase groups for better organization
export const PHASE_GROUPS: Record<string, PhaseGroup> = {
  'PLANNING_STAGE': {
    id: 'PLANNING_STAGE',
    name: 'Planning & Design',
    description: 'Get your project ready to build',
    icon: 'clipboard-list',
    phases: ['PRE_CONSTRUCTION'],
    estimatedDuration: '2-4 weeks',
    color: 'blue',
    isRecommended: true
  },
  'GROUND_STAGE': {
    id: 'GROUND_STAGE',
    name: 'Site & Foundation',
    description: 'Prepare site and build foundation',
    icon: 'hammer',
    phases: ['SITE_PREPARATION', 'FOUNDATION'],
    estimatedDuration: '3-6 weeks',
    color: 'orange',
    isRecommended: true
  },
  'STRUCTURE_STAGE': {
    id: 'STRUCTURE_STAGE',
    name: 'Structure & Shell',
    description: 'Build the main structure',
    icon: 'building',
    phases: ['STRUCTURAL_FRAME', 'WALLS_AND_PARTITIONS', 'ROOFING'],
    estimatedDuration: '8-12 weeks',
    color: 'emerald',
    isRecommended: true
  },
  'ENVELOPE_STAGE': {
    id: 'ENVELOPE_STAGE',
    name: 'Building Envelope',
    description: 'Complete the building exterior',
    icon: 'shield',
    phases: ['BUILDING_ENVELOPE'],
    estimatedDuration: '2-4 weeks',
    color: 'purple',
    isRecommended: true
  },
  'SYSTEMS_STAGE': {
    id: 'SYSTEMS_STAGE',
    name: 'MEP & Interior Systems',
    description: 'Install mechanical, electrical, and plumbing',
    icon: 'zap',
    phases: ['MEP_ROUGH_IN', 'INTERIOR_CONSTRUCTION'],
    estimatedDuration: '4-8 weeks',
    color: 'yellow',
    isRecommended: true
  },
  'FINISHES_STAGE': {
    id: 'FINISHES_STAGE',
    name: 'Finishes & Fixtures',
    description: 'Complete interior and exterior finishes',
    icon: 'palette',
    phases: ['INTERIOR_FINISHES', 'FIXTURES_AND_FITTINGS'],
    estimatedDuration: '6-10 weeks',
    color: 'pink',
    isRecommended: true
  },
  'COMPLETION_STAGE': {
    id: 'COMPLETION_STAGE',
    name: 'Final Works & Handover',
    description: 'Testing, external works, and project completion',
    icon: 'check-circle',
    phases: ['EXTERNAL_WORKS', 'TESTING_AND_COMMISSIONING', 'PROJECT_COMPLETION'],
    estimatedDuration: '2-4 weeks',
    color: 'green',
    isRecommended: true
  },
  'RENOVATION_STAGE': {
    id: 'RENOVATION_STAGE',
    name: 'Demolition & Modifications',
    description: 'Renovation-specific phases',
    icon: 'wrench',
    phases: ['DEMOLITION_AND_STRIP_OUT', 'STRUCTURAL_MODIFICATIONS'],
    estimatedDuration: '2-6 weeks',
    color: 'red',
    isRecommended: false // Only for renovation projects
  }
};

// Task priority and complexity mapping
const TASK_ENHANCEMENTS: Record<string, Partial<EnhancedTask>> = {
  // Critical foundation tasks
  'foundation_excavation': { priority: 'critical', complexity: 'moderate', estimatedDays: 3, skillLevel: 'professional', inspectionRequired: true },
  'foundation_concrete': { priority: 'critical', complexity: 'complex', estimatedDays: 2, skillLevel: 'professional', inspectionRequired: true },
  'waterproofing': { priority: 'critical', complexity: 'moderate', estimatedDays: 2, skillLevel: 'professional', inspectionRequired: false },
  
  // Structural tasks
  'columns': { priority: 'critical', complexity: 'complex', estimatedDays: 5, skillLevel: 'professional', inspectionRequired: true },
  'beams': { priority: 'critical', complexity: 'complex', estimatedDays: 4, skillLevel: 'professional', inspectionRequired: true },
  'floor_slabs': { priority: 'critical', complexity: 'complex', estimatedDays: 3, skillLevel: 'professional', inspectionRequired: true },
  
  // MEP critical tasks
  'electrical_conduits': { priority: 'critical', complexity: 'moderate', estimatedDays: 3, skillLevel: 'professional', inspectionRequired: true },
  'plumbing_rough': { priority: 'critical', complexity: 'moderate', estimatedDays: 4, skillLevel: 'professional', inspectionRequired: true },
  
  // Important but not critical
  'external_render': { priority: 'important', complexity: 'moderate', estimatedDays: 5, skillLevel: 'intermediate', inspectionRequired: false },
  'internal_doors': { priority: 'important', complexity: 'simple', estimatedDays: 2, skillLevel: 'intermediate', inspectionRequired: false },
  'painting': { priority: 'important', complexity: 'simple', estimatedDays: 4, skillLevel: 'basic', inspectionRequired: false },
  
  // Optional/luxury tasks
  'landscaping': { priority: 'optional', complexity: 'simple', estimatedDays: 3, skillLevel: 'basic', inspectionRequired: false, minBuildingSize: 200 },
  'swimming_pool': { priority: 'optional', complexity: 'complex', estimatedDays: 14, skillLevel: 'professional', inspectionRequired: true, minBuildingSize: 300 },
  'external_lighting': { priority: 'optional', complexity: 'simple', estimatedDays: 1, skillLevel: 'intermediate', inspectionRequired: false }
};

// Get recommended phases based on project context
export const getRecommendedPhases = (project: ProjectContext): string[] => {
  const scale = getProjectScale(project);
  const { projectType } = project;
  
  let recommendedPhases: string[] = [];
  
  if (projectType === 'renovation') {
    // Renovation projects need demolition first
    recommendedPhases = [
      'PRE_CONSTRUCTION',
      'DEMOLITION_AND_STRIP_OUT',
      'STRUCTURAL_MODIFICATIONS',
      'MEP_ROUGH_IN',
      'INTERIOR_CONSTRUCTION',
      'INTERIOR_FINISHES',
      'FIXTURES_AND_FITTINGS',
      'TESTING_AND_COMMISSIONING',
      'PROJECT_COMPLETION'
    ];
  } else {
    // Standard construction phases
    recommendedPhases = [
      'PRE_CONSTRUCTION',
      'SITE_PREPARATION',
      'FOUNDATION',
      'STRUCTURAL_FRAME',
      'WALLS_AND_PARTITIONS',
      'ROOFING',
      'BUILDING_ENVELOPE',
      'MEP_ROUGH_IN',
      'INTERIOR_CONSTRUCTION',
      'INTERIOR_FINISHES',
      'FIXTURES_AND_FITTINGS'
    ];
    
    // Add optional phases based on project scale
    if (scale === 'LARGE' || scale === 'EXTRA_LARGE') {
      recommendedPhases.push('EXTERNAL_WORKS');
    }
    
    if (scale === 'EXTRA_LARGE' || projectType === 'commercial') {
      recommendedPhases.push('TESTING_AND_COMMISSIONING');
    }
    
    recommendedPhases.push('PROJECT_COMPLETION');
  }
  
  return recommendedPhases;
};

// Get recommended phase groups based on project context
export const getRecommendedPhaseGroups = (project: ProjectContext): PhaseGroup[] => {
  const groups = Object.values(PHASE_GROUPS);
  const { projectType } = project;
  const scale = getProjectScale(project);
  
  return groups.map(group => ({
    ...group,
    isRecommended: projectType === 'renovation' 
      ? group.id === 'RENOVATION_STAGE' || ['PLANNING_STAGE', 'SYSTEMS_STAGE', 'FINISHES_STAGE', 'COMPLETION_STAGE'].includes(group.id)
      : group.id !== 'RENOVATION_STAGE' && (
          scale === 'SMALL' 
            ? ['PLANNING_STAGE', 'GROUND_STAGE', 'STRUCTURE_STAGE', 'FINISHES_STAGE', 'COMPLETION_STAGE'].includes(group.id)
            : true
        )
  }));
};

// Enhance tasks with context-aware metadata
export const enhanceTasksForProject = (phaseId: string, project: ProjectContext): EnhancedTask[] => {
  const phase = CONSTRUCTION_PHASES_WITH_TASKS[phaseId as keyof typeof CONSTRUCTION_PHASES_WITH_TASKS];
  if (!phase) return [];
  
  const scale = getProjectScale(project);
  const sizeInSqM = project.buildingSizeUnit === 'sq-ft' 
    ? project.buildingSize * 0.092903 
    : project.buildingSize;
  
  return phase.tasks.map((task: BaseTask) => {
    const enhancement = TASK_ENHANCEMENTS[task.id] || {};
    
    // Default values
    const enhancedTask: EnhancedTask = {
      id: task.id,
      name: task.name,
      alternativeNames: task.alternativeNames,
      priority: 'important',
      complexity: 'moderate',
      estimatedDays: 2,
      isRecommended: true,
      skillLevel: 'intermediate',
      inspectionRequired: false,
      ...enhancement
    };
    
    // Context-based recommendations
    if (enhancement.minBuildingSize && sizeInSqM < enhancement.minBuildingSize) {
      enhancedTask.isRecommended = false;
      enhancedTask.priority = 'optional';
    }
    
    if (enhancement.maxStoreys && project.storeys > enhancement.maxStoreys) {
      enhancedTask.complexity = 'complex';
      enhancedTask.estimatedDays = Math.ceil(enhancedTask.estimatedDays * 1.5);
    }
    
    // Scale-based adjustments
    if (scale === 'SMALL') {
      enhancedTask.estimatedDays = Math.max(1, Math.floor(enhancedTask.estimatedDays * 0.7));
    } else if (scale === 'EXTRA_LARGE') {
      enhancedTask.estimatedDays = Math.ceil(enhancedTask.estimatedDays * 1.5);
    }
    
    return enhancedTask;
  });
};

// Get phase duration estimate based on project context
export const getPhaseEstimatedDuration = (phaseId: string, project: ProjectContext): number => {
  const tasks = enhanceTasksForProject(phaseId, project);
  const totalDays = tasks.reduce((sum, task) => sum + task.estimatedDays, 0);
  return Math.ceil(totalDays / 5); // Convert to weeks (assuming 5 working days per week)
};

// Get project completion timeline estimate
export const getProjectTimelineEstimate = (phases: string[], project: ProjectContext): {
  totalWeeks: number;
  totalMonths: number;
  phaseBreakdown: Array<{ phaseId: string; weeks: number }>;
} => {
  const phaseBreakdown = phases.map(phaseId => ({
    phaseId,
    weeks: getPhaseEstimatedDuration(phaseId, project)
  }));
  
  const totalWeeks = phaseBreakdown.reduce((sum, phase) => sum + phase.weeks, 0);
  const totalMonths = Math.ceil(totalWeeks / 4.33); // Average weeks per month
  
  return {
    totalWeeks,
    totalMonths,
    phaseBreakdown
  };
};
