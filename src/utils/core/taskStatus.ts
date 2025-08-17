/**
 * Task Status Normalization Utilities
 * Centralizes task status handling to prevent data mismatch issues
 * Critical for phase status transition logic
 */

// Database task status enum (canonical)
export enum TaskStatusDB {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED', 
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED'
}

// UI-friendly task status enum
export enum TaskStatusUI {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked', 
  CANCELLED = 'cancelled'
}

// Available task statuses
export const TASK_STATUSES_DB: TaskStatusDB[] = Object.values(TaskStatusDB);
export const TASK_STATUSES_UI: TaskStatusUI[] = Object.values(TaskStatusUI);

// Status mappings using enums
export const TaskStatusUI_TO_DB: Record<TaskStatusUI, TaskStatusDB> = {
  [TaskStatusUI.PENDING]: TaskStatusDB.PENDING,
  [TaskStatusUI.IN_PROGRESS]: TaskStatusDB.IN_PROGRESS,
  [TaskStatusUI.COMPLETED]: TaskStatusDB.COMPLETED,
  [TaskStatusUI.BLOCKED]: TaskStatusDB.BLOCKED,
  [TaskStatusUI.CANCELLED]: TaskStatusDB.CANCELLED
};

export const TaskStatusDB_TO_UI: Record<TaskStatusDB, TaskStatusUI> = {
  [TaskStatusDB.PENDING]: TaskStatusUI.PENDING,
  [TaskStatusDB.IN_PROGRESS]: TaskStatusUI.IN_PROGRESS,
  [TaskStatusDB.COMPLETED]: TaskStatusUI.COMPLETED,
  [TaskStatusDB.BLOCKED]: TaskStatusUI.BLOCKED,
  [TaskStatusDB.CANCELLED]: TaskStatusUI.CANCELLED
};

/**
 * Normalize task status to database format
 * Handles various input formats and ensures consistent DB values
 */
export function toDbTaskStatus(input: TaskStatusUI | TaskStatusDB | string | undefined): TaskStatusDB {
  if (!input) return TaskStatusDB.PENDING;
  
  const normalized = String(input).trim().toUpperCase().replace(/[-\s]/g, '_');
  
  // Check if it's already a valid DB status
  if (Object.values(TaskStatusDB).includes(normalized as TaskStatusDB)) {
    return normalized as TaskStatusDB;
  }
  
  // Try to map from UI format
  const lowerInput = String(input).trim().toLowerCase().replace(/[_\s]/g, '-') as TaskStatusUI;
  if (lowerInput in TaskStatusUI_TO_DB) {
    return TaskStatusUI_TO_DB[lowerInput];
  }
  
  // Fallback for common variations
  switch (normalized) {
    case 'PROGRESS':
    case 'ACTIVE':
    case 'INPROGRESS':
      return TaskStatusDB.IN_PROGRESS;
    case 'DONE':
    case 'FINISHED':
      return TaskStatusDB.COMPLETED;
    case 'WAITING':
    case 'TODO': 
      return TaskStatusDB.PENDING;
    case 'PAUSED':
    case 'HOLD':
      return TaskStatusDB.BLOCKED;
    default:
      return TaskStatusDB.PENDING;
  }
}

/**
 * Normalize task status to UI format
 * Handles various input formats and ensures consistent UI values
 */
export function toUiTaskStatus(input: TaskStatusDB | TaskStatusUI | string | undefined): TaskStatusUI {
  if (!input) return TaskStatusUI.PENDING;
  
  const upperInput = String(input).trim().toUpperCase().replace(/[-\s]/g, '_') as TaskStatusDB;
  
  // Check if it's a valid DB status
  if (upperInput in TaskStatusDB_TO_UI) {
    return TaskStatusDB_TO_UI[upperInput];
  }
  
  // Check if it's already a UI status
  const lowerInput = String(input).trim().toLowerCase().replace(/[_\s]/g, '-') as TaskStatusUI;
  if (Object.values(TaskStatusUI).includes(lowerInput)) {
    return lowerInput;
  }
  
  // Fallback for common variations
  const normalized = String(input).trim().toLowerCase();
  switch (normalized) {
    case 'progress':
    case 'active':
    case 'inprogress':
      return TaskStatusUI.IN_PROGRESS;
    case 'done':
    case 'finished':
      return TaskStatusUI.COMPLETED;
    case 'waiting':
    case 'todo':
      return TaskStatusUI.PENDING;
    case 'paused':
    case 'hold':
      return TaskStatusUI.BLOCKED;
    default:
      return TaskStatusUI.PENDING;
  }
}

/**
 * Get human-readable task status label
 */
export function formatTaskStatusLabel(status: TaskStatusDB | TaskStatusUI | string): string {
  const dbStatus = toDbTaskStatus(status);
  
  switch (dbStatus) {
    case TaskStatusDB.PENDING:
      return 'Pending';
    case TaskStatusDB.IN_PROGRESS:
      return 'In Progress';
    case TaskStatusDB.COMPLETED:
      return 'Completed';
    case TaskStatusDB.BLOCKED:
      return 'Blocked';
    case TaskStatusDB.CANCELLED:
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

/**
 * Check if task status represents an active/working state
 */
export function isTaskActive(status: TaskStatusDB | TaskStatusUI | string): boolean {
  const dbStatus = toDbTaskStatus(status);
  return dbStatus === TaskStatusDB.IN_PROGRESS;
}

/**
 * Check if task status represents a completed state
 */
export function isTaskCompleted(status: TaskStatusDB | TaskStatusUI | string): boolean {
  const dbStatus = toDbTaskStatus(status);
  return dbStatus === TaskStatusDB.COMPLETED;
}

/**
 * Check if task status represents a blocked/paused state
 */
export function isTaskBlocked(status: TaskStatusDB | TaskStatusUI | string): boolean {
  const dbStatus = toDbTaskStatus(status);
  return dbStatus === TaskStatusDB.BLOCKED;
}

/**
 * Get task status priority for sorting (lower number = higher priority)
 */
export function getTaskStatusPriority(status: TaskStatusDB | TaskStatusUI | string): number {
  const dbStatus = toDbTaskStatus(status);
  
  switch (dbStatus) {
    case TaskStatusDB.IN_PROGRESS:
      return 1; // Highest priority
    case TaskStatusDB.BLOCKED:
      return 2;
    case TaskStatusDB.PENDING:
      return 3;
    case TaskStatusDB.COMPLETED:
      return 4;
    case TaskStatusDB.CANCELLED:
      return 5; // Lowest priority
    default:
      return 3;
  }
}