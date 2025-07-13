/**
 * Project Data Adapter
 * Converts Project data format to Plan data format for modal compatibility
 */

import type { Project, Phase } from '@/types/project';
import type { ConstructionPlan, PlanPhase, PlanTask } from '@/types/plan';

/**
 * Convert Project data to ConstructionPlan format for modal system
 */
export const adaptProjectToPlan = (project: Project): ConstructionPlan => {
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    projectType: project.type || 'Construction',
    clientName: project.client || '',
    location: project.location || '',
    estimatedDuration: calculateDuration(project.startDate, project.endDate),
    startDate: project.startDate ? (project.startDate instanceof Date ? project.startDate.toISOString() : project.startDate) : new Date().toISOString(),
    endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate.toISOString() : project.endDate) : new Date().toISOString(),
    status: 'draft' as const, // Default status
    phases: project.phases.map(adaptPhaseToPlanPhase),
    budget: {
      total: project.budget || 0,
      allocated: project.budget || 0,
      spent: project.spent || 0,
      remaining: (project.budget || 0) - (project.spent || 0),
      categories: [],
      lastUpdated: new Date().toISOString()
    },
    team: project.teamMembers.map((member, index) => ({
      id: `team-${index}`,
      name: member,
      role: 'Team Member',
      email: '',
      phone: '',
      status: 'active' as const,
      assignedTasks: []
    })),
    documents: [],
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
};

/**
 * Convert Phase data to PlanPhase format
 */
const adaptPhaseToPlanPhase = (phase: Phase): PlanPhase => {
  return {
    id: phase.id,
    name: phase.name,
    description: phase.description || '',
    order: 0, // Will be set based on array index
    status: mapPhaseStatus(phase.status),
    startDate: phase.startDate ? (phase.startDate instanceof Date ? phase.startDate.toISOString() : phase.startDate) : new Date().toISOString(),
    endDate: phase.endDate ? (phase.endDate instanceof Date ? phase.endDate.toISOString() : phase.endDate) : new Date().toISOString(),
    duration: calculateDuration(phase.startDate, phase.endDate),
    progress: phase.completion || 0,
    tasks: phase.tasks.map(task => adaptTaskToPlanTask(task, phase.id)),
    materials: [], // Add if exists in future
    dependencies: [],
    budget: {
      allocated: parseFloat(phase.budget || '0'),
      spent: 0,
      remaining: parseFloat(phase.budget || '0')
    }
  };
};

/**
 * Convert Task data to PlanTask format
 */
const adaptTaskToPlanTask = (task: any, phaseId?: string): PlanTask => {
  return {
    id: task.id,
    name: task.name,
    description: task.description || '',
    status: mapTaskStatus(task.status),
    assignee: task.assignedTo || '',
    startDate: task.startDate ? (task.startDate instanceof Date ? task.startDate.toISOString() : task.startDate) : new Date().toISOString(),
    endDate: task.endDate ? (task.endDate instanceof Date ? task.endDate.toISOString() : task.endDate) : new Date().toISOString(),
    progress: task.progress || 0,
    priority: mapTaskPriority(task.priority),
    dependencies: [],
    estimatedHours: task.duration || 8, // Use duration from mock data or default
    actualHours: 0,
    phaseId: task.phaseId || phaseId || ''
  };
};

/**
 * Helper function to calculate duration between dates
 */
const calculateDuration = (startDate?: Date | string, endDate?: Date | string): string => {
  if (!startDate || !endDate) return '0 days';
  
  // Convert to Date objects if they're strings
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0 days';
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
};

/**
 * Map project phase status to plan phase status
 */
const mapPhaseStatus = (status: string): PlanPhase['status'] => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'in-progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    case 'planning':
      return 'planning';
    case 'on-hold':
      return 'on-hold';
    default:
      return 'pending';
  }
};

/**
 * Map project task status to plan task status
 */
const mapTaskStatus = (status?: string): PlanTask['status'] => {
  if (!status) return 'not-started';
  
  switch (status.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'in-progress':
    case 'active':
      return 'in-progress';
    case 'on-hold':
      return 'on-hold';
    case 'pending':
      return 'not-started';
    default:
      return 'not-started';
  }
};

/**
 * Map project task priority to plan task priority
 */
const mapTaskPriority = (priority?: string): PlanTask['priority'] => {
  if (!priority) return 'medium';
  
  switch (priority.toLowerCase()) {
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    case 'medium':
    default:
      return 'medium';
  }
};

/**
 * Convert ConstructionPlan changes back to Project format (for saving)
 */
export const adaptPlanToProject = (plan: ConstructionPlan, originalProject: Project): Partial<Project> => {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    client: plan.clientName,
    type: plan.projectType,
    location: plan.location,
    budget: plan.budget?.total || 0,
    spent: plan.budget?.spent || 0,
    startDate: plan.startDate ? new Date(plan.startDate) : originalProject.startDate,
    endDate: plan.endDate ? new Date(plan.endDate) : originalProject.endDate,
    phases: plan.phases.map((planPhase, index) => ({
      ...originalProject.phases.find(p => p.id === planPhase.id) || {},
      id: planPhase.id,
      name: planPhase.name,
      description: planPhase.description || '',
      startDate: new Date(planPhase.startDate),
      endDate: new Date(planPhase.endDate),
      budget: planPhase.budget?.allocated?.toString() || '0',
      status: planPhase.status,
      completion: planPhase.progress,
      tasks: planPhase.tasks.map(planTask => ({
        ...originalProject.phases.find(p => p.id === planPhase.id)?.tasks.find(t => t.id === planTask.id) || {},
        id: planTask.id,
        name: planTask.name,
        description: planTask.description,
        status: planTask.status as any,
        startDate: new Date(planTask.startDate),
        endDate: new Date(planTask.endDate),
        assignedTo: planTask.assignee,
        progress: planTask.progress,
        phaseId: planPhase.id,
        priority: planTask.priority as any
      }))
    }))
  };
};