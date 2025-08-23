/**
 * Standardized Activity Logging Utilities
 * Ensures consistent activity tracking across all BuildEase operations
 */

import * as activityService from '@/services/activityService';
import { supabase } from '@/lib/supabase';
import type { ActivityType } from '@/types/database';

// ============================================================================
// STANDARDIZED ACTIVITY PATTERNS
// ============================================================================

export interface StandardActivityData {
  projectId: string;
  activityType: ActivityType;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  customTitle?: string;
  customDescription?: string;
}

export interface ActivityLogResult {
  success: boolean;
  activityId?: string;
  error?: string;
}

// ============================================================================
// STANDARDIZED TITLE GENERATORS
// ============================================================================

/**
 * Generate standardized activity titles
 * Format: {Action} {Entity}: {Name}
 */
export function generateActivityTitle(
  activityType: ActivityType,
  entityName?: string,
  customContext?: Record<string, any>
): string {
  const context = customContext || {};
  
  switch (activityType) {
    // Project Operations
    case 'project_create':
      return `Project created: ${entityName}`;
    case 'project_update':
      return `Project updated: ${entityName}`;
    case 'project_status_update':
      return `Project ${context.status || 'status changed'}: ${entityName}`;
    case 'project_delete':
      return `Project deleted: ${entityName}`;
    case 'project_complete':
      return `Project completed: ${entityName} ✅`;

    // Task Operations
    case 'task_create':
      return `Task created: ${entityName}${context.phaseText || ''}`;
    case 'task_update':
      return `Task updated: ${entityName}`;
    case 'task_complete':
      return `Task completed: ${entityName}`;
    case 'task_delete':
      return `Task deleted: ${entityName}`;
    case 'task_assign':
      return `Task assigned: ${entityName}`;
    case 'task_unassign':
      return `Task unassigned: ${entityName}`;
    case 'task_status_update':
      return `Task ${context.status || 'status changed'}: ${entityName}`;

    // Phase Operations  
    case 'phase_create':
      return `Phase created: ${entityName}`;
    case 'phase_update':
      return `Phase updated: ${entityName}`;
    case 'phase_complete':
      return `Phase completed: ${entityName}`;
    case 'phase_delete':
      return `Phase deleted: ${entityName}`;

    // Team Operations
    case 'team_member_add':
      return `Team member added: ${entityName}`;
    case 'team_member_remove':
      return `Team member removed: ${entityName}`;
    case 'team_member_update':
      return `Team member updated: ${entityName}`;
    case 'project_member_add':
      return `${context.role || 'Member'} added: ${entityName}`;
    case 'project_member_remove':
      return `Team member removed: ${entityName}`;
    case 'project_member_role_update':
      return `Role changed to ${context.role}: ${entityName}`;

    // Budget/Expense Operations
    case 'expense_create':
      return `Expense added: ${entityName}`;
    case 'expense_update':
      return `Expense updated: ${entityName}`;
    case 'expense_delete':
      return `Expense removed: ${entityName}`;
    case 'budget_update':
      return `Budget updated: ${context.changeText || 'modified'}`;

    // Document Operations
    case 'document_upload':
      return `${context.fileTypeText || 'File'} uploaded: ${entityName}`;
    case 'document_delete':
      return `${context.fileTypeText || 'File'} removed: ${entityName}`;
    case 'document_update':
      return `Document updated: ${entityName}`;

    // Comment Operations
    case 'comment_create':
      return `New comment added`;
    case 'comment_reply':
      return `Reply added to discussion`;
    case 'comment_update':
      return `Comment edited`;
    case 'comment_delete':
      return `Comment removed`;

    // Default fallback
    default:
      return `${activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${entityName || 'Operation completed'}`;
  }
}

/**
 * Generate standardized activity descriptions
 * Format: {Entity} "{name}" was {action} {additional_context}
 */
export function generateActivityDescription(
  activityType: ActivityType,
  entityName?: string,
  customContext?: Record<string, any>
): string {
  const context = customContext || {};
  const entityLabel = context.entityLabel || getEntityLabel(activityType);
  
  switch (activityType) {
    // Project Operations
    case 'project_create':
      return `Project "${entityName}" was successfully created${context.client ? ` for client ${context.client}` : ''}${context.projectType ? ` (${context.projectType})` : ''}`;
    case 'project_update':
      if (context.updates?.length > 0) {
        return `Project "${entityName}" was updated: ${context.updates.join(', ')}`;
      }
      return `Project "${entityName}" details were modified`;
    case 'project_status_update':
      return `Project "${entityName}" status was changed to ${context.status}${context.progress ? ` (${context.progress}% complete)` : ''}`;
    case 'project_delete':
      return `Project "${entityName}" was permanently removed from the system`;
    case 'project_complete':
      return `Project "${entityName}" has been marked as completed${context.progress ? ` with ${context.progress}% progress` : ''}`;

    // Task Operations
    case 'task_create':
      return `Task "${entityName}" was created${context.phaseText ? ` in ${context.phaseText}` : ''}${context.assignee ? ` and assigned to ${context.assignee}` : ''}`;
    case 'task_update':
      if (context.changes?.length > 0) {
        return `Task "${entityName}" was updated: ${context.changes.join(', ')}`;
      }
      return `Task "${entityName}" details were modified`;
    case 'task_complete':
      return `Task "${entityName}" was marked as completed${context.phaseText ? ` in ${context.phaseText}` : ''}`;
    case 'task_delete':
      return `Task "${entityName}" was removed from the project`;
    case 'task_assign':
      return `Task "${entityName}" was assigned to ${context.assigneeName || 'team member'}`;
    case 'task_unassign':
      return `Task "${entityName}" was unassigned`;
    case 'task_status_update':
      return `Task "${entityName}" status was changed to ${context.status}`;

    // Phase Operations
    case 'phase_create':
      return `Phase "${entityName}" was created${context.description ? `: ${context.description}` : ''}`;
    case 'phase_update':
      return `Phase "${entityName}" details were updated`;
    case 'phase_complete':
      return `Phase "${entityName}" has been completed`;
    case 'phase_delete':
      return `Phase "${entityName}" was removed from the project`;

    // Team Operations
    case 'team_member_add':
      return `Team member "${entityName}" was added to the project team${context.role ? ` with ${context.role} permissions` : ''}`;
    case 'team_member_remove':
      return `Team member "${entityName}" was removed from the project team`;
    case 'team_member_update':
      return `Team member "${entityName}" details were updated`;
    case 'project_member_add':
      return `${entityName} was added to the project team with ${context.role || 'member'} permissions`;
    case 'project_member_remove':
      return `Team member was removed from the project team`;
    case 'project_member_role_update':
      return `${entityName}'s project permissions were updated to ${context.role || 'member'} level access`;

    // Budget/Expense Operations
    case 'expense_create':
      return `Expense "${entityName}" was added to the project budget${context.amount ? ` (${context.currency || '$'}${context.amount.toLocaleString()})` : ''}`;
    case 'expense_update':
      return `Expense "${entityName}" was modified${context.amount ? ` (${context.currency || '$'}${context.amount.toLocaleString()})` : ''}`;
    case 'expense_delete':
      return `Expense "${entityName}" was removed from the project budget`;
    case 'budget_update':
      return `Project budget was updated from ${context.currency || '$'}${context.previousAmount?.toLocaleString()} to ${context.currency || '$'}${context.newAmount?.toLocaleString()}`;

    // Document Operations
    case 'document_upload':
      return `${context.documentType || 'Document'} "${entityName}" was added to the project${context.phaseText ? ` (${context.phaseText})` : ''}`;
    case 'document_delete':
      return `${context.documentType || 'Document'} "${entityName}" was removed from the project`;
    case 'document_update':
      return `Document "${entityName}" details were updated${context.changes ? `: ${context.changes}` : ''}`;

    // Comment Operations
    case 'comment_create':
      return `New comment was added: "${context.preview || 'Comment content'}${context.truncated ? '...' : ''}"`;
    case 'comment_reply':
      return `Reply was added: "${context.preview || 'Reply content'}${context.truncated ? '...' : ''}"`;
    case 'comment_update':
      return `Comment was edited: "${context.preview || 'Updated content'}${context.truncated ? '...' : ''}"`;
    case 'comment_delete':
      return `A comment was removed from the project discussion`;

    // Default fallback
    default:
      return `${entityLabel} "${entityName}" was ${getActionVerb(activityType)}`;
  }
}

/**
 * Get appropriate entity label for activity type
 */
function getEntityLabel(activityType: ActivityType): string {
  if (activityType.startsWith('project')) return 'Project';
  if (activityType.startsWith('task')) return 'Task';
  if (activityType.startsWith('phase')) return 'Phase';
  if (activityType.startsWith('team') || activityType.includes('member')) return 'Team member';
  if (activityType.startsWith('expense')) return 'Expense';
  if (activityType.startsWith('budget')) return 'Budget';
  if (activityType.startsWith('document')) return 'Document';
  if (activityType.startsWith('comment')) return 'Comment';
  return 'Item';
}

/**
 * Get appropriate action verb for activity type
 */
function getActionVerb(activityType: ActivityType): string {
  if (activityType.includes('create')) return 'created';
  if (activityType.includes('update')) return 'updated';
  if (activityType.includes('delete')) return 'deleted';
  if (activityType.includes('complete')) return 'completed';
  if (activityType.includes('assign')) return 'assigned';
  if (activityType.includes('add')) return 'added';
  if (activityType.includes('remove')) return 'removed';
  return 'modified';
}

/**
 * Determine appropriate status for activity type
 */
export function getActivityStatus(activityType: ActivityType, customContext?: Record<string, any>): 'success' | 'info' | 'warning' | 'error' {
  const context = customContext || {};
  
  // Explicit status override
  if (context.status) return context.status;
  
  // Success operations
  if (activityType.includes('create') || activityType.includes('complete') || activityType.includes('add')) {
    return 'success';
  }
  
  // Warning operations (deletions, removals)
  if (activityType.includes('delete') || activityType.includes('remove')) {
    return 'warning';
  }
  
  // Default to info for updates and other operations
  return 'info';
}

// ============================================================================
// STANDARDIZED LOGGING FUNCTIONS
// ============================================================================

/**
 * Log activity with standardized patterns - uses batching for high-frequency operations
 */
export async function logActivity(data: StandardActivityData): Promise<ActivityLogResult> {
  try {
    // Get current user if not provided
    let userId = data.userId;
    let userName = data.userName;
    
    if (!userId || !userName) {
      const { data: auth } = await supabase.auth.getUser();
      if (auth.user) {
        userId = auth.user.id;
        userName = (auth.user.user_metadata?.full_name as string) ||
                  (auth.user.user_metadata?.name as string) ||
                  (auth.user.email as string) ||
                  'Unknown User';
      }
    }

    // Generate standardized title and description
    const title = data.customTitle || generateActivityTitle(data.activityType, data.entityName, data.metadata);
    const description = data.customDescription || generateActivityDescription(data.activityType, data.entityName, data.metadata);
    const status = getActivityStatus(data.activityType, data.metadata);

    // Determine logging method based on activity type
    const shouldBatch = shouldUseBatchedLogging(data.activityType);
    
    const activityData = {
      project_id: data.projectId,
      activity_type: data.activityType,
      title,
      description,
      user_id: userId,
      user_name: userName,
      entity_type: data.entityType || null,
      entity_id: data.entityId || null,
      metadata: data.metadata || {},
      status
    };

    const result = shouldBatch 
      ? await activityService.createBatchedActivity(activityData)
      : await activityService.createActivity(activityData);

    return {
      success: !!result,
      activityId: result?.id
    };

  } catch (error) {
    console.error('Activity logging failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Determine if activity type should use batched logging
 * High-frequency operations use batching to reduce noise
 */
function shouldUseBatchedLogging(activityType: ActivityType): boolean {
  const batchedTypes: ActivityType[] = [
    'task_create',
    'comment_create',
    'comment_reply',
    'document_upload'  // Batch document uploads since they can be bulk operations
  ];
  
  return batchedTypes.includes(activityType);
}

/**
 * Fire-and-forget activity logging
 * Use this for non-critical activity logging that shouldn't block the main operation
 */
export function logActivityAsync(data: StandardActivityData): void {
  // Fire-and-forget pattern
  (async () => {
    try {
      await logActivity(data);
    } catch (error) {
      // Silent failure for fire-and-forget logging
      console.error('Async activity logging failed:', error);
    }
  })();
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Log project operation
 */
export async function logProjectActivity(
  projectId: string,
  activityType: 'project_create' | 'project_update' | 'project_status_update' | 'project_delete' | 'project_complete',
  projectName: string,
  context?: Record<string, any>
) {
  return logActivity({
    projectId,
    activityType,
    entityType: 'project',
    entityId: projectId,
    entityName: projectName,
    metadata: context
  });
}

/**
 * Log task operation
 */
export async function logTaskActivity(
  projectId: string,
  activityType: 'task_create' | 'task_update' | 'task_complete' | 'task_delete' | 'task_assign' | 'task_unassign' | 'task_status_update',
  taskId: string,
  taskTitle: string,
  context?: Record<string, any>
) {
  return logActivity({
    projectId,
    activityType,
    entityType: 'task',
    entityId: taskId,
    entityName: taskTitle,
    metadata: context
  });
}

/**
 * Log team member operation
 */
export async function logTeamActivity(
  projectId: string,
  activityType: 'team_member_add' | 'team_member_remove' | 'team_member_update' | 'project_member_add' | 'project_member_remove' | 'project_member_role_update',
  memberId: string,
  memberName: string,
  context?: Record<string, any>
) {
  return logActivity({
    projectId,
    activityType,
    entityType: 'team_member',
    entityId: memberId,
    entityName: memberName,
    metadata: context
  });
}

/**
 * Log document operation
 */
export async function logDocumentActivity(
  projectId: string,
  activityType: 'document_upload' | 'document_delete' | 'document_update',
  documentId: string,
  documentName: string,
  context?: Record<string, any>
) {
  return logActivity({
    projectId,
    activityType,
    entityType: 'document',
    entityId: documentId,
    entityName: documentName,
    metadata: context
  });
}

/**
 * Log budget/expense operation  
 */
export async function logBudgetActivity(
  projectId: string,
  activityType: 'expense_create' | 'expense_update' | 'expense_delete' | 'budget_update',
  entityId: string,
  entityName: string,
  context?: Record<string, any>
) {
  return logActivity({
    projectId,
    activityType,
    entityType: 'expense',
    entityId,
    entityName,
    metadata: context
  });
}