/**
 * Data Normalization Utilities
 * Centralizes all data transformation and normalization logic
 * Critical for preventing status mismatch bugs between UI and database
 */

import { toDbPhaseStatus, toUiPhaseStatus, PhaseStatusDB, PhaseStatusUI } from './phaseStatus';
import { toDbTaskStatus, toUiTaskStatus, TaskStatusDB, TaskStatusUI } from './taskStatus';

// Re-export for convenience
export { PhaseStatusDB, PhaseStatusUI, TaskStatusDB, TaskStatusUI };
export { toDbPhaseStatus, toUiPhaseStatus, toDbTaskStatus, toUiTaskStatus };

/**
 * Normalize project data from database to UI format
 * Ensures consistent status format across the application
 */
export function normalizeProjectData(project: any): any {
  if (!project) return project;
  console.log('project data before normalization ' , project)
  return {
    ...project,
    // Normalize phase data if present
    ...(project.phases && {
      phases: project.phases.map(normalizePhaseData)
    })
  
  };
}

/**
 * Normalize phase data from database to UI format
 */
export function normalizePhaseData(phase: any): any {
  if (!phase) return phase;
  
  return {
    ...phase,
    // Normalize phase status
    status: toUiPhaseStatus(phase.status),
    // Normalize task data if present
    ...(phase.tasks && {
      tasks: phase.tasks.map(normalizeTaskData)
    })
  };
}

/**
 * Normalize task data from database to UI format
 */
export function normalizeTaskData(task: any): any {
  if (!task) return task;
  
  return {
    ...task,
    // Normalize task status
    status: toUiTaskStatus(task.status)
  };
}

/**
 * Prepare phase data for database submission
 * Converts UI format to database format
 */
export function preparePhaseForDb(phase: any): any {
  if (!phase) return phase;
  
  return {
    ...phase,
    // Convert status to DB format
    status: toDbPhaseStatus(phase.status),
    // Convert task statuses if present
    ...(phase.tasks && {
      tasks: phase.tasks.map(prepareTaskForDb)
    })
  };
}

/**
 * Prepare task data for database submission
 */
export function prepareTaskForDb(task: any): any {
  if (!task) return task;
  
  return {
    ...task,
    // Convert status to DB format
    status: toDbTaskStatus(task.status)
  };
}

/**
 * Safe status comparison that handles format differences
 * Normalizes both statuses to DB format before comparison
 */
export function compareStatuses(status1: string, status2: string, type: 'phase' | 'task' = 'phase'): boolean {
  if (type === 'phase') {
    return toDbPhaseStatus(status1) === toDbPhaseStatus(status2);
  } else {
    return toDbTaskStatus(status1) === toDbTaskStatus(status2);
  }
}

/**
 * Normalize phase status transitions for consistency
 * Ensures proper state management during phase updates
 */
export function normalizePhaseStatusTransition(currentStatus: string, newStatus: string): {
  fromStatus: PhaseStatusDB;
  toStatus: PhaseStatusDB;
  isValid: boolean;
} {
  const fromStatus = toDbPhaseStatus(currentStatus);
  const toStatus = toDbPhaseStatus(newStatus);
  
  // Define valid transitions using enums
  const validTransitions: Record<PhaseStatusDB, PhaseStatusDB[]> = {
    [PhaseStatusDB.PLANNING]: [PhaseStatusDB.IN_PROGRESS, PhaseStatusDB.PAUSED],
    [PhaseStatusDB.IN_PROGRESS]: [PhaseStatusDB.PAUSED, PhaseStatusDB.COMPLETED],
    [PhaseStatusDB.PAUSED]: [PhaseStatusDB.IN_PROGRESS, PhaseStatusDB.COMPLETED],
    [PhaseStatusDB.COMPLETED]: [] // No transitions from completed
  };
  
  const isValid = validTransitions[fromStatus]?.includes(toStatus) || fromStatus === toStatus;
  
  return {
    fromStatus,
    toStatus,
    isValid
  };
}

/**
 * Calculate phase status based on tasks
 * Implements the business logic for automatic phase status transitions
 */
export function calculatePhaseStatusFromTasks(tasks: Array<{ status: string }>): PhaseStatusDB {
  if (!tasks || tasks.length === 0) {
    return PhaseStatusDB.PLANNING;
  }
  
  // Normalize all task statuses
  const normalizedTasks = tasks.map(task => toDbTaskStatus(task.status));
  
  // Count task statuses
  const statusCounts = normalizedTasks.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatusDB, number>);
  
  const totalTasks = normalizedTasks.length;
  const completedTasks = statusCounts[TaskStatusDB.COMPLETED] || 0;
  const inProgressTasks = statusCounts[TaskStatusDB.IN_PROGRESS] || 0;
  const blockedTasks = statusCounts[TaskStatusDB.BLOCKED] || 0;
  
  // Business logic for phase status calculation
  if (completedTasks === totalTasks) {
    return PhaseStatusDB.COMPLETED;
  }
  
  if (inProgressTasks > 0) {
    return PhaseStatusDB.IN_PROGRESS;
  }
  
  // If all tasks are blocked, phase is paused
  if (blockedTasks === totalTasks) {
    return PhaseStatusDB.PAUSED;
  }
  
  // Default to planning for pending tasks or mixed states
  return PhaseStatusDB.PLANNING;
}

/**
 * Validate data consistency between related entities
 * Returns validation errors if any inconsistencies are found
 */
export function validateDataConsistency(data: {
  phase?: any;
  tasks?: any[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.phase && data.tasks) {
    // Validate phase status matches task states
    const calculatedStatus = calculatePhaseStatusFromTasks(data.tasks);
    const actualStatus = toDbPhaseStatus(data.phase.status);
    
    if (calculatedStatus !== actualStatus) {
      errors.push(
        `Phase status mismatch: Expected '${calculatedStatus}' based on tasks, but got '${actualStatus}'`
      );
    }
  }
  
  // Validate status formats
  if (data.phase?.status) {
    try {
      toDbPhaseStatus(data.phase.status);
    } catch {
      errors.push(`Invalid phase status format: ${data.phase.status}`);
    }
  }
  
  if (data.tasks) {
    data.tasks.forEach((task, index) => {
      if (task.status) {
        try {
          toDbTaskStatus(task.status);
        } catch {
          errors.push(`Invalid task status format at index ${index}: ${task.status}`);
        }
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and normalize user input for status fields
 * Prevents invalid status values from being submitted
 */
export function sanitizeStatusInput(input: string, type: 'phase' | 'task'): string {
  if (type === 'phase') {
    return toDbPhaseStatus(input);
  } else {
    return toDbTaskStatus(input);
  }
}

/**
 * Utility to handle status field migrations during data updates
 * Ensures backward compatibility when status formats change
 */
export function migrateStatusFields(data: any, type: 'phase' | 'task'): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => migrateStatusFields(item, type));
  }
  
  if (typeof data === 'object' && data.status) {
    return {
      ...data,
      status: type === 'phase' ? toDbPhaseStatus(data.status) : toDbTaskStatus(data.status)
    };
  }
  
  return data;
}