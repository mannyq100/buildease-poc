/**
 * Functional Activity Service
 * Uses dedicated be_project_activity table for clean separation of concerns
 * Optimized for project activity tracking with purpose-built schema
 */

import { supabase } from '@/lib/supabase';
import NotificationService from './notificationService';
import { TABLE_NAMES } from '@/types/database';
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
 * Create a new project activity record
 * Uses dedicated be_project_activity table for optimal performance
 */
export async function createActivity(data: CreateActivityData): Promise<ProjectActivity | null> {
  try {
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

    const { data: activity, error } = await supabase
      .from(TABLE_NAMES.PROJECT_ACTIVITIES)
      .insert(activityData)
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return null;
    }

    // Send real-time notification for significant activities
    if (shouldNotify(data.activity_type)) {
      await broadcastActivity(activity);
    }

    return activity;
  } catch (error) {
    console.error('Error in createActivity:', error);
    return null;
  }
}

/**
 * Get activities for a project with filtering
 * Uses dedicated be_project_activity table for optimal performance
 */
export async function getProjectActivities(filter: ActivityFilter): Promise<ProjectActivity[]> {
  try {
    let query = supabase
      .from(TABLE_NAMES.PROJECT_ACTIVITIES)
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
  return supabase
    .channel(`project-activities-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: TABLE_NAMES.PROJECT_ACTIVITIES,
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
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
  return createActivity({
    project_id: projectId,
    activity_type: 'document_upload',
    title: `Document uploaded: ${documentName}`,
    description: `${documentType} document added to project`,
    user_id: userId,
    user_name: userName,
    entity_type: 'document',
    entity_id: documentId,
    metadata: { documentType, documentName },
    status: 'success'
  });
}

export async function trackDocumentDelete(
  projectId: string, 
  documentName: string, 
  userId?: string, 
  userName?: string
): Promise<ProjectActivity | null> {
  return createActivity({
    project_id: projectId,
    activity_type: 'document_delete',
    title: `Document removed: ${documentName}`,
    description: `Document deleted from project`,
    user_id: userId,
    user_name: userName,
    entity_type: 'document',
    metadata: { documentName },
    status: 'info'
  });
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

    const { data: createdActivities, error } = await supabase
      .from(TABLE_NAMES.PROJECT_ACTIVITIES)
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