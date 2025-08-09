/**
 * Functional Activity Service
 * Uses dedicated be_project_activity table for clean separation of concerns
 * Optimized for project activity tracking with purpose-built schema
 */

import { supabase } from '@/lib/supabase';
import NotificationService from './notificationService';
import { logger } from '@/utils/core/logger';
import { addActivityToBatch } from './activityBatchingService';
// Supabase client is already configured with schema 'construction_mgr' (see lib/supabase.ts)
// Therefore, use the unqualified table name here
const ACTIVITY_TABLE_FQN = 'be_project_activity';
import type { 
  ProjectActivity, 
  ProjectActivityInsert, 
  ActivityType
} from '@/types/database';

// Types
interface CreateActivityData {
  project_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  user_id?: string;
  user_name?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  status?: 'success' | 'info' | 'warning' | 'error';
}

interface ActivityFilter {
  project_id: string;
  activity_types?: ActivityType[];
  user_id?: string;
  entity_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
}

// Activity types that should trigger notifications
const NOTIFIABLE_ACTIVITY_TYPES: ActivityType[] = [
  'task_complete',
  'phase_update',
  'status_change',
  'inspection',
  'delivery',
  'weather_delay'
];

/**
 * Create a new project activity record with optional batching
 * Uses dedicated be_project_activity table for optimal performance
 */
export async function createActivity(data: CreateActivityData): Promise<ProjectActivity | null> {
  return createActivityDirect(data);
}

/**
 * Create a batched activity (groups similar activities together)
 * Reduces noise in activity feeds for common operations
 */
export async function createBatchedActivity(data: CreateActivityData): Promise<void> {
  try {
    await addActivityToBatch({
      project_id: data.project_id,
      activity_type: data.activity_type,
      title: data.title,
      description: data.description,
      user_id: data.user_id,
      user_name: data.user_name,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      metadata: data.metadata,
      status: data.status
    });
  } catch (error) {
    console.error('[ACTIVITY_BATCH] Batching failed, falling back to direct creation:', error);
    // Fallback to direct creation if batching fails
    await createActivityDirect(data);
  }
}

/**
 * Create a project activity record directly (no batching)
 * Uses dedicated be_project_activity table for optimal performance
 */
export async function createActivityDirect(data: CreateActivityData): Promise<ProjectActivity | null> {
  try {
    console.log('[ACTIVITY_DEBUG] [ActivityService] createActivity() called with data:', {
      data,
      timestamp: new Date().toISOString(),
      tableName: ACTIVITY_TABLE_FQN
    });
    logger.debug('[ActivityService] createActivity() called', { data });
    
    const activityData: ProjectActivityInsert = {
      project_id: data.project_id,
      activity_type: data.activity_type,
      title: data.title,
      description: data.description || null,
      user_id: data.user_id || null,
      user_name: data.user_name || null,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      metadata: data.metadata || {},
      status: data.status || 'info'
    };

    console.log('[ACTIVITY_DEBUG] [ActivityService] Prepared activityData for database insert:', {
      activityData,
      table: ACTIVITY_TABLE_FQN,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('[ActivityService] createActivity() inserting', { table: ACTIVITY_TABLE_FQN, activityData });
    
    console.log('[ACTIVITY_DEBUG] [ActivityService] About to call supabase.from().insert()');
    const { data: activity, error } = await supabase
      .from(ACTIVITY_TABLE_FQN)
      .insert(activityData)
      .select()
      .single();

    console.log('[ACTIVITY_DEBUG] [ActivityService] Database insert completed:', {
      success: !!activity,
      hasError: !!error,
      activityId: activity?.id,
      timestamp: new Date().toISOString()
    });

    if (error) {
      type PgError = { message: string; code?: string; details?: string; hint?: string };
      const pgErr = error as PgError;
      console.error('[ACTIVITY_DEBUG] [ActivityService] Database error creating activity:', {
        message: pgErr.message,
        code: pgErr.code,
        details: pgErr.details,
        hint: pgErr.hint,
        activityData,
        rawError: error,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    console.log('[ACTIVITY_DEBUG] [ActivityService] Activity created successfully:', {
      activityId: activity.id,
      activityType: activity.activity_type,
      projectId: activity.project_id,
      title: activity.title,
      timestamp: new Date().toISOString()
    });

    // Send real-time notification for significant activities
    if (shouldNotify(data.activity_type)) {
      console.log('[ACTIVITY_DEBUG] [ActivityService] Broadcasting notification for activity type:', data.activity_type);
      logger.debug('[ActivityService] broadcasting notification', { activityType: data.activity_type });
      await broadcastActivity(activity);
    } else {
      console.log('[ACTIVITY_DEBUG] [ActivityService] Skipping notification broadcast for activity type:', data.activity_type);
    }

    logger.debug('[ActivityService] createActivity() success', { id: activity.id });
    return activity;
  } catch (error) {
    console.error('[ACTIVITY_DEBUG] [ActivityService] Unexpected error in createActivity:', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      inputData: data,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

/**
 * Get activities for a project with filtering
 * Uses dedicated be_project_activity table for optimal performance
 */
export async function getProjectActivities(filter: ActivityFilter): Promise<ProjectActivity[]> {
  try {
    logger.debug('[ActivityService] getProjectActivities()', { filter });
    let query = supabase
      .from(ACTIVITY_TABLE_FQN)
      .select('*')
      .eq('project_id', filter.project_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filter.activity_types?.length) {
      query = query.in('activity_type', filter.activity_types);
    }

    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id);
    }

    if (filter.entity_type) {
      query = query.eq('entity_type', filter.entity_type);
    }

    if (filter.status) {
      query = query.eq('status', filter.status);
    }

    if (filter.date_from) {
      query = query.gte('created_at', filter.date_from);
    }

    if (filter.date_to) {
      query = query.lte('created_at', filter.date_to);
    }

    // Apply pagination
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    logger.debug('[ActivityService] getProjectActivities() success', { count: activities?.length || 0 });
    return activities || [];
  } catch (error) {
    console.error('Error in getProjectActivities:', error);
    return [];
  }
}

/**
 * Get recent activities for a project (last 7 days)
 */
export async function getRecentActivities(projectId: string, limit = 10): Promise<ProjectActivity[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return getProjectActivities({
    project_id: projectId,
    date_from: sevenDaysAgo.toISOString(),
    limit
  });
}

/**
 * Subscribe to real-time activity updates for a project
 * Uses dedicated be_project_activity table for efficient real-time updates
 */
export function subscribeToProjectActivities(
  projectId: string, 
  callback: (activity: ProjectActivity) => void
) {
  logger.debug('[ActivityService] subscribeToProjectActivities()', { projectId });
  return supabase
    .channel(`project-activities-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'construction_mgr',
        table: 'be_project_activity',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        logger.debug('[ActivityService] realtime INSERT received', { projectId, table: 'be_project_activity', id: (payload.new as ProjectActivity)?.id });
        callback(payload.new as ProjectActivity);
      }
    )
    .subscribe();
}

/**
 * Activity creation helpers for common operations
 */
export async function trackDocumentUpload(
  projectId: string, 
  documentId: string, 
  documentName: string, 
  documentType: string, 
  userId?: string, 
  userName?: string
): Promise<ProjectActivity | null> {
  console.log('[ACTIVITY_DEBUG] [ActivityService] trackDocumentUpload() called with params:', {
    projectId,
    documentId,
    documentName,
    documentType,
    userId,
    userName,
    timestamp: new Date().toISOString()
  });
  
  logger.debug('[ActivityService] trackDocumentUpload()', { projectId, documentId, documentName, documentType, userId, userName });
  
  // Get file extension for more descriptive messaging
  const fileExtension = documentName.split('.').pop()?.toUpperCase() || '';
  const fileTypeText = fileExtension ? ` ${fileExtension}` : '';
  
  const result = await createBatchedActivity({
    project_id: projectId,
    activity_type: 'document_upload',
    title: `New${fileTypeText} file uploaded: ${documentName}`,
    description: `${documentType} document "${documentName}" was added to project`,
    user_id: userId,
    user_name: userName,
    entity_type: 'document',
    entity_id: documentId,
    metadata: { 
      documentType, 
      documentName, 
      fileExtension,
      fileTypeText 
    },
    status: 'success'
  });
  
  console.log('[ACTIVITY_DEBUG] [ActivityService] trackDocumentUpload() result:', {
    success: !!result,
    activityId: result?.id,
    documentId,
    documentName,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

export async function trackDocumentDelete(
  projectId: string, 
  documentName: string, 
  userId?: string, 
  userName?: string
): Promise<ProjectActivity | null> {
  console.log('[ACTIVITY_DEBUG] [ActivityService] trackDocumentDelete() called with params:', {
    projectId,
    documentName,
    userId,
    userName,
    timestamp: new Date().toISOString()
  });
  
  logger.debug('[ActivityService] trackDocumentDelete()', { projectId, documentName, userId, userName });
  
  // Get file extension and type for better messaging
  const fileExtension = documentName.split('.').pop()?.toUpperCase() || '';
  const fileTypeText = fileExtension ? ` ${fileExtension}` : '';
  
  const result = await createActivity({
    project_id: projectId,
    activity_type: 'document_delete',
    title: `${fileTypeText} file removed: ${documentName}`,
    description: `Document "${documentName}" was deleted from project`,
    user_id: userId,
    user_name: userName,
    entity_type: 'document',
    metadata: { 
      documentName,
      fileExtension,
      fileTypeText 
    },
    status: 'warning'
  });
  
  console.log('[ACTIVITY_DEBUG] [ActivityService] trackDocumentDelete() result:', {
    success: !!result,
    activityId: result?.id,
    documentName,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

export async function trackExpenseCreate(
  projectId: string, 
  expenseId: string, 
  title: string, 
  amount: number, 
  currency: string, 
  userId?: string, 
  userName?: string
): Promise<ProjectActivity | null> {
  return createActivity({
    project_id: projectId,
    activity_type: 'expense_create',
    title: `New expense: ${title}`,
    description: `Added expense of ${currency} ${amount.toLocaleString()}`,
    user_id: userId,
    user_name: userName,
    entity_type: 'expense',
    entity_id: expenseId,
    metadata: { amount, currency, expenseTitle: title },
    status: 'info'
  });
}

export async function trackTaskComplete(
  projectId: string, 
  taskId: string, 
  taskTitle: string, 
  phaseId?: string, 
  userId?: string, 
  userName?: string
): Promise<ProjectActivity | null> {
  return createActivity({
    project_id: projectId,
    activity_type: 'task_complete',
    title: `Task completed: ${taskTitle}`,
    description: `Task marked as complete`,
    user_id: userId,
    user_name: userName,
    entity_type: 'task',
    entity_id: taskId,
    metadata: { taskTitle, phaseId },
    status: 'success'
  });
}

export async function trackStatusChange(
  projectId: string, 
  title: string, 
  description: string, 
  status: 'success' | 'info' | 'warning' | 'error' = 'info',
  userId?: string, 
  userName?: string,
  metadata?: Record<string, unknown>
): Promise<ProjectActivity | null> {
  return createActivity({
    project_id: projectId,
    activity_type: 'status_change',
    title,
    description,
    user_id: userId,
    user_name: userName,
    metadata: metadata || {},
    status
  });
}

export async function trackBudgetUpdate(
  projectId: string, 
  previousAmount: number, 
  newAmount: number, 
  currency: string, 
  userId?: string, 
  userName?: string
): Promise<ProjectActivity | null> {
  const change = newAmount - previousAmount;
  const changeText = change > 0 ? `increased by` : `decreased by`;
  
  return createActivity({
    project_id: projectId,
    activity_type: 'budget_update',
    title: `Budget ${changeText} ${currency} ${Math.abs(change).toLocaleString()}`,
    description: `Budget updated from ${currency} ${previousAmount.toLocaleString()} to ${currency} ${newAmount.toLocaleString()}`,
    user_id: userId,
    user_name: userName,
    entity_type: 'budget',
    metadata: { previousAmount, newAmount, currency, change },
    status: 'info'
  });
}

/**
 * Bulk activity creation for system operations
 * Uses dedicated be_project_activity table for optimal bulk insertions
 */
export async function createBulkActivities(activities: CreateActivityData[]): Promise<ProjectActivity[]> {
  try {
    logger.debug('[ActivityService] createBulkActivities() called', { count: activities.length, sample: activities[0] });
    const activityInserts: ProjectActivityInsert[] = activities.map(data => ({
      project_id: data.project_id,
      activity_type: data.activity_type,
      title: data.title,
      description: data.description || null,
      user_id: data.user_id || null,
      user_name: data.user_name || null,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      metadata: data.metadata || {},
      status: data.status || 'info'
    }));

    logger.debug('[ActivityService] createBulkActivities() inserting', { table: ACTIVITY_TABLE_FQN, count: activityInserts.length });
    const { data: createdActivities, error } = await supabase
      .from(ACTIVITY_TABLE_FQN)
      .insert(activityInserts)
      .select();

    if (error) {
      console.error('Error creating bulk activities:', error);
      return [];
    }

    return createdActivities || [];
  } catch (error) {
    console.error('Error in createBulkActivities:', error);
    return [];
  }
}

/**
 * Get activity statistics for a project
 */
export async function getActivityStats(projectId: string, days = 30): Promise<{
  total: number;
  byType: Record<ActivityType, number>;
  byStatus: Record<string, number>;
  byUser: Record<string, number>;
}> {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const activities = await getProjectActivities({
      project_id: projectId,
      date_from: dateFrom.toISOString(),
      limit: 1000 // High limit for stats
    });

    const stats = {
      total: activities.length,
      byType: {} as Record<ActivityType, number>,
      byStatus: {} as Record<string, number>,
      byUser: {} as Record<string, number>
    };

    activities.forEach(activity => {
      // Count by type
      stats.byType[activity.activity_type] = (stats.byType[activity.activity_type] || 0) + 1;
      
      // Count by status
      stats.byStatus[activity.status] = (stats.byStatus[activity.status] || 0) + 1;
      
      // Count by user
      if (activity.user_name) {
        stats.byUser[activity.user_name] = (stats.byUser[activity.user_name] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting activity stats:', error);
    return {
      total: 0,
      byType: {} as Record<ActivityType, number>,
      byStatus: {} as Record<string, number>,
      byUser: {} as Record<string, number>
    };
  }
}

/**
 * Private helper functions
 */
function shouldNotify(activityType: ActivityType): boolean {
  return NOTIFIABLE_ACTIVITY_TYPES.includes(activityType);
}

async function broadcastActivity(activity: ProjectActivity): Promise<void> {
  try {
    // Send notification to project members
    await NotificationService.createProjectNotification({
      project_id: activity.project_id,
      title: activity.title,
      message: activity.description || '',
      notification_type: 'project_update',
      metadata: {
        activity_id: activity.id,
        activity_type: activity.activity_type,
        ...activity.metadata
      }
    });
  } catch (error) {
    console.error('Error broadcasting activity:', error);
  }
}