/**
 * Unified Phase Utility Functions
 * Comprehensive phase and task management utilities for BuildEase
 * Includes both basic phase utilities and enhanced context-aware functionality
 */

import { CONSTRUCTION_PHASES_WITH_TASKS, getPhasesForProjectType } from '../data/constants/constructionPhasesWithTasks';
import type { ProjectType } from '../data/constants/constructionPhasesWithTasks';

// ===== BASIC PHASE UTILITIES (from original phaseUtils.ts) =====

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
                 getPhaseTemplatesForProjectType('residential-single');
  
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

// ===== ENHANCED PHASE UTILITIES (from enhancedPhaseUtils.ts) =====

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
    icon: 'home',
    phases: ['SITE_PREPARATION', 'EXCAVATION', 'FOUNDATION'],
    estimatedDuration: '4-8 weeks',
    color: 'brown',
    isRecommended: true
  },
  'STRUCTURE_STAGE': {
    id: 'STRUCTURE_STAGE',
    name: 'Structure & Frame',
    description: 'Build the structural elements',
    icon: 'building',
    phases: ['FRAMING', 'STRUCTURAL'],
    estimatedDuration: '4-12 weeks',
    color: 'orange',
    isRecommended: true
  },
  'ENVELOPE_STAGE': {
    id: 'ENVELOPE_STAGE',
    name: 'Building Envelope',
    description: 'Weatherproof and secure the building',
    icon: 'shield',
    phases: ['ROOFING', 'EXTERIOR_WALLS', 'WINDOWS_DOORS'],
    estimatedDuration: '3-8 weeks',
    color: 'green',
    isRecommended: true
  },
  'SYSTEMS_STAGE': {
    id: 'SYSTEMS_STAGE',
    name: 'Building Systems',
    description: 'Install mechanical, electrical, and plumbing',
    icon: 'settings',
    phases: ['ELECTRICAL', 'PLUMBING', 'HVAC'],
    estimatedDuration: '4-10 weeks',
    color: 'purple',
    isRecommended: true
  },
  'FINISHES_STAGE': {
    id: 'FINISHES_STAGE',
    name: 'Interior Finishes',
    description: 'Complete interior spaces',
    icon: 'paintbrush',
    phases: ['INSULATION_DRYWALL', 'FLOORING', 'INTERIOR_FINISHES', 'CABINETRY_MILLWORK'],
    estimatedDuration: '6-16 weeks',
    color: 'indigo',
    isRecommended: true
  },
  'COMPLETION_STAGE': {
    id: 'COMPLETION_STAGE',
    name: 'Final Completion',
    description: 'Final inspections and handover',
    icon: 'check-circle',
    phases: ['FINAL_INSPECTIONS', 'LANDSCAPING'],
    estimatedDuration: '2-4 weeks',
    color: 'emerald',
    isRecommended: true
  }
};

// Enhanced utility functions
export function getRecommendedPhaseGroups(project: ProjectContext): PhaseGroup[] {
  const scale = getProjectScale(project);
  const projectType = project.projectType;
  
  return Object.values(PHASE_GROUPS).filter(group => {
    if (!group.isRecommended) return false;
    
    // All groups are recommended for most projects
    // Could add scale-based filtering here if needed
    return true;
  });
}

export function getRecommendedPhases(project: ProjectContext): string[] {
  const phaseTemplates = getPhaseTemplatesForProjectType(project.projectType);
  return phaseTemplates.map(phase => phase.category);
}

export function enhanceTasksForProject(tasks: TaskTemplate[], project: ProjectContext): EnhancedTask[] {
  const scale = getProjectScale(project);
  
  return tasks.map(task => ({
    id: task.id,
    name: task.name,
    priority: 'important' as const, // Default priority
    complexity: 'moderate' as const, // Default complexity
    estimatedDays: getEstimatedDaysForTask(task.name, scale),
    isRecommended: true,
    skillLevel: 'intermediate' as const, // Default skill level
    inspectionRequired: taskRequiresInspection(task.name),
    applicableProjectTypes: [project.projectType]
  }));
}

export function getProjectTimelineEstimate(project: ProjectContext): {
  totalWeeks: number;
  phases: Array<{
    phase: string;
    weeks: number;
    startWeek: number;
    endWeek: number;
  }>;
} {
  const scale = getProjectScale(project);
  const phaseGroups = getRecommendedPhaseGroups(project);
  
  let currentWeek = 1;
  const phases = [];
  
  for (const group of phaseGroups) {
    const baseWeeks = parseInt(group.estimatedDuration.split('-')[0]) || 2;
    const scaleMultiplier = getScaleMultiplier(scale);
    const adjustedWeeks = Math.ceil(baseWeeks * scaleMultiplier);
    
    phases.push({
      phase: group.name,
      weeks: adjustedWeeks,
      startWeek: currentWeek,
      endWeek: currentWeek + adjustedWeeks - 1
    });
    
    currentWeek += adjustedWeeks;
  }
  
  return {
    totalWeeks: currentWeek - 1,
    phases
  };
}

// Helper functions
function getEstimatedDaysForTask(taskName: string, scale: ProjectScale): number {
  const baseEstimates: Record<string, number> = {
    'Site Survey': 1,
    'Permits and Approvals': 14,
    'Architectural Plans': 7,
    'Structural Plans': 5,
    'Site Preparation': 3,
    'Excavation': 5,
    'Foundation': 10,
    'Framing': 14,
    'Roofing': 7,
    'Electrical Rough-in': 5,
    'Plumbing Rough-in': 5,
    'HVAC Installation': 7,
    'Insulation': 3,
    'Drywall': 7,
    'Interior Paint': 5,
    'Flooring': 7,
    'Kitchen Cabinets': 3,
    'Final Electrical': 3,
    'Final Plumbing': 3,
    'Final Inspection': 1
  };
  
  const baseEstimate = baseEstimates[taskName] || 3; // Default 3 days
  return Math.ceil(baseEstimate * getScaleMultiplier(scale));
}

function taskRequiresInspection(taskName: string): boolean {
  const inspectionTasks = [
    'Foundation',
    'Framing',
    'Electrical Rough-in',
    'Plumbing Rough-in',
    'Final Electrical',
    'Final Plumbing',
    'Final Inspection'
  ];
  
  return inspectionTasks.some(task => taskName.toLowerCase().includes(task.toLowerCase()));
}

function getScaleMultiplier(scale: ProjectScale): number {
  switch (scale) {
    case 'SMALL': return 0.7;
    case 'MEDIUM': return 1.0;
    case 'LARGE': return 1.5;
    case 'EXTRA_LARGE': return 2.0;
    default: return 1.0;
  }
}