/**
 * Activity Batching Service
 * Intelligent batching of related activities to reduce noise and improve readability
 * Groups similar activities together for better user experience
 */

import * as activityService from './activityService';
import type { ActivityType } from '@/types/database';

interface BatchableActivity {
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
  timestamp: number;
}

interface ActivityBatch {
  activities: BatchableActivity[];
  batchKey: string;
  firstActivity: BatchableActivity;
  lastActivity: BatchableActivity;
  timeWindow: number;
}

// Configuration for batching behavior
const BATCHING_CONFIG = {
  // Time window in milliseconds for batching similar activities
  TIME_WINDOW: 5 * 60 * 1000, // 5 minutes
  
  // Maximum number of activities to batch together
  MAX_BATCH_SIZE: 10,
  
  // Delay before processing batched activities (to allow more to accumulate)
  BATCH_DELAY: 30 * 1000, // 30 seconds
  
  // Activity types that should be batched
  BATCHABLE_TYPES: [
    'task_create',
    'task_update', 
    'task_complete',
    'document_upload',
    'expense_create',
    'expense_update',
    'comment_create',
    'comment_reply'
  ] as ActivityType[],
  
  // Activity types that should NEVER be batched (always show individually)
  NEVER_BATCH_TYPES: [
    'project_create',
    'project_delete',
    'phase_create',
    'phase_delete',
    'team_member_add',
    'team_member_remove',
    'project_status_update'
  ] as ActivityType[]
};

// In-memory batch storage
const activeBatches = new Map<string, ActivityBatch>();
const batchTimers = new Map<string, NodeJS.Timeout>();

/**
 * Generate a batch key for grouping similar activities
 */
function generateBatchKey(activity: BatchableActivity): string {
  // Group by: project_id + activity_type + user_id + entity_type
  const key = `${activity.project_id}_${activity.activity_type}_${activity.user_id || 'anonymous'}_${activity.entity_type || 'unknown'}`;
  return key;
}

/**
 * Check if an activity type should be batched
 */
function shouldBatchActivity(activityType: ActivityType): boolean {
  if (BATCHING_CONFIG.NEVER_BATCH_TYPES.includes(activityType)) {
    return false;
  }
  return BATCHING_CONFIG.BATCHABLE_TYPES.includes(activityType);
}

/**
 * Create a batched activity summary
 */
function createBatchedActivitySummary(batch: ActivityBatch): {
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  status: 'success' | 'info' | 'warning' | 'error';
} {
  const { activities, firstActivity } = batch;
  const count = activities.length;
  const activityType = firstActivity.activity_type;
  const userName = firstActivity.user_name || 'Someone';
  
  // Create batched title based on activity type
  let title: string;
  let description: string;
  let status: 'success' | 'info' | 'warning' | 'error' = 'info';
  
  switch (activityType) {
    case 'task_create':
      title = count === 1 ? 'Task created' : `${count} tasks created`;
      description = count === 1 
        ? `${userName} created a task: "${firstActivity.metadata?.taskTitle || 'Untitled'}"`
        : `${userName} created ${count} tasks`;
      status = 'success';
      break;
      
    case 'task_update':
      title = count === 1 ? 'Task updated' : `${count} tasks updated`;
      description = count === 1 
        ? `${userName} updated a task: "${firstActivity.metadata?.taskTitle || 'Untitled'}"`
        : `${userName} updated ${count} tasks`;
      status = 'info';
      break;
      
    case 'task_complete':
      title = count === 1 ? 'Task completed' : `${count} tasks completed`;
      description = count === 1 
        ? `${userName} completed: "${firstActivity.metadata?.taskTitle || 'Task'}"`
        : `${userName} completed ${count} tasks`;
      status = 'success';
      break;
      
    case 'document_upload':
      title = count === 1 ? 'Document uploaded' : `${count} documents uploaded`;
      description = count === 1 
        ? `${userName} uploaded: "${firstActivity.metadata?.fileName || 'Document'}"`
        : `${userName} uploaded ${count} documents`;
      status = 'info';
      break;
      
    case 'expense_create':
      title = count === 1 ? 'Expense added' : `${count} expenses added`;
      description = count === 1 
        ? `${userName} added expense: "${firstActivity.metadata?.expenseName || 'Expense'}"`
        : `${userName} added ${count} budget expenses`;
      status = 'success';
      break;
      
    case 'expense_update':
      title = count === 1 ? 'Expense updated' : `${count} expenses updated`;
      description = count === 1 
        ? `${userName} updated expense: "${firstActivity.metadata?.expenseName || 'Expense'}"`
        : `${userName} updated ${count} budget expenses`;
      status = 'info';
      break;
      
    case 'comment_create':
      title = count === 1 ? 'Comment added' : `${count} comments added`;
      description = count === 1 
        ? `${userName} commented: "${firstActivity.metadata?.contentPreview || 'Comment'}"`
        : `${userName} added ${count} comments`;
      status = 'info';
      break;
      
    case 'comment_reply':
      title = count === 1 ? 'Reply added' : `${count} replies added`;
      description = count === 1 
        ? `${userName} replied: "${firstActivity.metadata?.contentPreview || 'Reply'}"`
        : `${userName} added ${count} replies`;
      status = 'info';
      break;
      
    default:
      title = count === 1 ? firstActivity.title : `${count} activities`;
      description = count === 1 
        ? firstActivity.description || `${userName} performed an action`
        : `${userName} performed ${count} ${activityType.replace('_', ' ')} actions`;
  }
  
  // Collect metadata from all activities
  const batchMetadata = {
    batchSize: count,
    activityType,
    timeSpan: batch.lastActivity.timestamp - batch.firstActivity.timestamp,
    firstActivityTime: new Date(batch.firstActivity.timestamp).toISOString(),
    lastActivityTime: new Date(batch.lastActivity.timestamp).toISOString(),
    entityIds: activities.map(a => a.entity_id).filter(Boolean),
    originalActivities: activities.map(a => ({
      title: a.title,
      entity_id: a.entity_id,
      metadata: a.metadata
    }))
  };
  
  return { title, description, metadata: batchMetadata, status };
}

/**
 * Process a batch of activities and create a single batched activity
 */
async function processBatch(batchKey: string): Promise<void> {
  const batch = activeBatches.get(batchKey);
  if (!batch || batch.activities.length === 0) {
    return;
  }
  
  try {
    console.log('[ACTIVITY_BATCH] Processing batch:', {
      batchKey,
      activityCount: batch.activities.length,
      activityType: batch.firstActivity.activity_type,
      timeSpan: batch.lastActivity.timestamp - batch.firstActivity.timestamp
    });
    
    // Create batched activity summary
    const { title, description, metadata, status } = createBatchedActivitySummary(batch);
    
    // Create the batched activity record
    await activityService.createActivity({
      project_id: batch.firstActivity.project_id,
      activity_type: batch.firstActivity.activity_type,
      title,
      description,
      user_id: batch.firstActivity.user_id,
      user_name: batch.firstActivity.user_name,
      entity_type: 'batch',
      entity_id: null, // Batches aren't tied to a specific entity, so use null instead of long batch key
      metadata: {
        ...metadata,
        batchKey, // Store batch key in metadata for debugging
        originalEntityIds: batch.activities.map(a => a.entity_id).filter(Boolean)
      },
      status
    });
    
    console.log('[ACTIVITY_BATCH] Batch processed successfully:', {
      batchKey,
      title,
      originalCount: batch.activities.length
    });
    
  } catch (error) {
    console.error('[ACTIVITY_BATCH] Failed to process batch:', {
      batchKey,
      error,
      activityCount: batch.activities.length
    });
    
    // Fallback: create individual activities if batching fails
    for (const activity of batch.activities) {
      try {
        await activityService.createActivity({
          project_id: activity.project_id,
          activity_type: activity.activity_type,
          title: activity.title,
          description: activity.description,
          user_id: activity.user_id,
          user_name: activity.user_name,
          entity_type: activity.entity_type,
          entity_id: activity.entity_id,
          metadata: activity.metadata,
          status: activity.status
        });
      } catch (individualError) {
        console.error('[ACTIVITY_BATCH] Failed to create individual activity:', {
          activityId: activity.entity_id,
          error: individualError
        });
      }
    }
  } finally {
    // Clean up batch
    activeBatches.delete(batchKey);
    const timer = batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      batchTimers.delete(batchKey);
    }
  }
}

/**
 * Add an activity to a batch or process it immediately
 */
export async function addActivityToBatch(activityData: Omit<BatchableActivity, 'timestamp'>): Promise<void> {
  const activity: BatchableActivity = {
    ...activityData,
    timestamp: Date.now()
  };
  
  // Check if this activity type should be batched
  if (!shouldBatchActivity(activity.activity_type)) {
    // Process immediately for non-batchable activities
    console.log('[ACTIVITY_BATCH] Non-batchable activity, processing immediately:', activity.activity_type);
    await activityService.createActivity(activity);
    return;
  }
  
  const batchKey = generateBatchKey(activity);
  
  console.log('[ACTIVITY_BATCH] Adding activity to batch:', {
    batchKey,
    activityType: activity.activity_type,
    title: activity.title
  });
  
  // Get or create batch
  let batch = activeBatches.get(batchKey);
  if (!batch) {
    batch = {
      activities: [],
      batchKey,
      firstActivity: activity,
      lastActivity: activity,
      timeWindow: BATCHING_CONFIG.TIME_WINDOW
    };
    activeBatches.set(batchKey, batch);
  }
  
  // Check if activity fits within time window
  const timeDiff = activity.timestamp - batch.lastActivity.timestamp;
  if (timeDiff > BATCHING_CONFIG.TIME_WINDOW) {
    // Time window expired, process current batch and start new one
    console.log('[ACTIVITY_BATCH] Time window expired, processing current batch');
    await processBatch(batchKey);
    
    // Start new batch
    batch = {
      activities: [activity],
      batchKey,
      firstActivity: activity,
      lastActivity: activity,
      timeWindow: BATCHING_CONFIG.TIME_WINDOW
    };
    activeBatches.set(batchKey, batch);
  } else {
    // Add to existing batch
    batch.activities.push(activity);
    batch.lastActivity = activity;
    
    // Check if batch is full
    if (batch.activities.length >= BATCHING_CONFIG.MAX_BATCH_SIZE) {
      console.log('[ACTIVITY_BATCH] Batch size limit reached, processing immediately');
      await processBatch(batchKey);
      return;
    }
  }
  
  // Set or reset timer for batch processing
  const existingTimer = batchTimers.get(batchKey);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  const timer = setTimeout(() => {
    processBatch(batchKey);
  }, BATCHING_CONFIG.BATCH_DELAY);
  
  batchTimers.set(batchKey, timer);
}

/**
 * Force process all pending batches (useful for cleanup or immediate processing)
 */
export async function flushAllBatches(): Promise<void> {
  console.log('[ACTIVITY_BATCH] Flushing all pending batches');
  const batchKeys = Array.from(activeBatches.keys());
  
  for (const batchKey of batchKeys) {
    const timer = batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      batchTimers.delete(batchKey);
    }
    await processBatch(batchKey);
  }
}

/**
 * Get current batching statistics (for debugging)
 */
export function getBatchingStats(): {
  activeBatches: number;
  pendingTimers: number;
  batchDetails: Array<{
    batchKey: string;
    activityCount: number;
    activityType: ActivityType;
    timeSpan: number;
  }>;
} {
  const batchDetails = Array.from(activeBatches.entries()).map(([key, batch]) => ({
    batchKey: key,
    activityCount: batch.activities.length,
    activityType: batch.firstActivity.activity_type,
    timeSpan: batch.lastActivity.timestamp - batch.firstActivity.timestamp
  }));
  
  return {
    activeBatches: activeBatches.size,
    pendingTimers: batchTimers.size,
    batchDetails
  };
}