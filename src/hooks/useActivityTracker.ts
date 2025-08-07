/**
 * Activity Tracker Hook
 * Provides a clean, reusable interface for tracking project activities
 * Encapsulates activity tracking logic with error boundaries and user context
 */

import { useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useActivityErrorBoundary } from './useActivityErrorBoundary';
import { getProjectCurrency, getUserDisplayName } from '@/utils/projectUtils';
import * as activityService from '@/services/activityService';
import type { ActivityType } from '@/types/database';

interface UseActivityTrackerProps {
  projectId: string;
}

interface ActivityTrackingOptions {
  skipErrorBoundary?: boolean;
  fallbackMessage?: string;
}

export function useActivityTracker({ projectId }: UseActivityTrackerProps) {
  const { user } = useSupabaseAuth();
  const { safeActivityTrack } = useActivityErrorBoundary();

  // Get user context for activity tracking
  const getUserContext = useCallback(() => ({
    userId: user?.id,
    userName: getUserDisplayName(user)
  }), [user]);

  // Core activity creation with error boundary
  const trackActivity = useCallback(async (
    activityType: ActivityType,
    title: string,
    description: string,
    options?: {
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
      status?: 'success' | 'info' | 'warning' | 'error';
      skipErrorBoundary?: boolean;
      fallbackMessage?: string;
    }
  ) => {
    const { userId, userName } = getUserContext();
    
    const activityData = {
      project_id: projectId,
      activity_type: activityType,
      title,
      description,
      user_id: userId,
      user_name: userName,
      entity_type: options?.entityType,
      entity_id: options?.entityId,
      metadata: options?.metadata || {},
      status: options?.status || 'info'
    };

    if (options?.skipErrorBoundary) {
      return activityService.createActivity(activityData);
    }

    return safeActivityTrack(
      `${activityType}-tracking`,
      () => activityService.createActivity(activityData),
      options?.fallbackMessage
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  // Document operations
  const trackDocumentUpload = useCallback(async (
    documentId: string,
    documentName: string,
    documentType: string,
    options?: ActivityTrackingOptions
  ) => {
    const { userId, userName } = getUserContext();
    
    if (options?.skipErrorBoundary) {
      return activityService.trackDocumentUpload(
        projectId, documentId, documentName, documentType, userId, userName
      );
    }

    return safeActivityTrack(
      'document-upload',
      () => activityService.trackDocumentUpload(
        projectId, documentId, documentName, documentType, userId, userName
      ),
      options?.fallbackMessage || 'Document uploaded but activity not recorded'
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  const trackDocumentDelete = useCallback(async (
    documentName: string,
    options?: ActivityTrackingOptions
  ) => {
    const { userId, userName } = getUserContext();
    
    if (options?.skipErrorBoundary) {
      return activityService.trackDocumentDelete(
        projectId, documentName, userId, userName
      );
    }

    return safeActivityTrack(
      'document-delete',
      () => activityService.trackDocumentDelete(
        projectId, documentName, userId, userName
      ),
      options?.fallbackMessage || 'Document deleted but activity not recorded'
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  // Expense operations
  const trackExpenseCreate = useCallback(async (
    expenseId: string,
    expenseName: string,
    amount: number,
    options?: ActivityTrackingOptions & { currency?: string }
  ) => {
    const { userId, userName } = getUserContext();
    
    const trackingFn = async () => {
      const currency = options?.currency || await getProjectCurrency(projectId);
      return activityService.trackExpenseCreate(
        projectId, expenseId, expenseName, amount, currency, userId, userName
      );
    };

    if (options?.skipErrorBoundary) {
      return trackingFn();
    }

    return safeActivityTrack(
      'expense-create',
      trackingFn,
      options?.fallbackMessage || 'Expense created but activity not recorded'
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  const trackBudgetUpdate = useCallback(async (
    previousAmount: number,
    newAmount: number,
    options?: ActivityTrackingOptions & { currency?: string }
  ) => {
    const { userId, userName } = getUserContext();
    
    const trackingFn = async () => {
      const currency = options?.currency || await getProjectCurrency(projectId);
      return activityService.trackBudgetUpdate(
        projectId, previousAmount, newAmount, currency, userId, userName
      );
    };

    if (options?.skipErrorBoundary) {
      return trackingFn();
    }

    return safeActivityTrack(
      'budget-update',
      trackingFn,
      options?.fallbackMessage || 'Budget updated but activity not recorded'
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  // Task operations
  const trackTaskComplete = useCallback(async (
    taskId: string,
    taskTitle: string,
    phaseId?: string,
    options?: ActivityTrackingOptions
  ) => {
    const { userId, userName } = getUserContext();
    
    if (options?.skipErrorBoundary) {
      return activityService.trackTaskComplete(
        projectId, taskId, taskTitle, phaseId, userId, userName
      );
    }

    return safeActivityTrack(
      'task-complete',
      () => activityService.trackTaskComplete(
        projectId, taskId, taskTitle, phaseId, userId, userName
      ),
      options?.fallbackMessage || 'Task completed but activity not recorded'
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  // Status and phase operations
  const trackStatusChange = useCallback(async (
    title: string,
    description: string,
    status: 'success' | 'info' | 'warning' | 'error' = 'info',
    metadata?: Record<string, unknown>,
    options?: ActivityTrackingOptions
  ) => {
    const { userId, userName } = getUserContext();
    
    if (options?.skipErrorBoundary) {
      return activityService.trackStatusChange(
        projectId, title, description, status, userId, userName, metadata
      );
    }

    return safeActivityTrack(
      'status-change',
      () => activityService.trackStatusChange(
        projectId, title, description, status, userId, userName, metadata
      ),
      options?.fallbackMessage || 'Status changed but activity not recorded'
    );
  }, [projectId, getUserContext, safeActivityTrack]);

  // Team member operations
  const trackTeamMemberAdd = useCallback(async (
    memberId: string,
    memberName: string,
    role: string,
    options?: ActivityTrackingOptions & { 
      status?: string;
      email?: string;
      phone?: string;
    }
  ) => {
    return trackActivity(
      'team_member_add',
      `Team member added: ${memberName}`,
      `${memberName} joined as ${role}`,
      {
        entityType: 'team_member',
        entityId: memberId,
        metadata: {
          memberName,
          role,
          status: options?.status,
          email: options?.email,
          phone: options?.phone
        },
        status: 'success',
        skipErrorBoundary: options?.skipErrorBoundary,
        fallbackMessage: options?.fallbackMessage || 'Team member added but activity not recorded'
      }
    );
  }, [trackActivity]);

  const trackTeamMemberRemove = useCallback(async (
    memberId: string,
    memberName: string,
    options?: ActivityTrackingOptions
  ) => {
    return trackActivity(
      'team_member_remove',
      `Team member removed: ${memberName}`,
      `Team member was removed from the project`,
      {
        entityType: 'team_member',
        entityId: memberId,
        metadata: { memberName },
        status: 'warning',
        skipErrorBoundary: options?.skipErrorBoundary,
        fallbackMessage: options?.fallbackMessage || 'Team member removed but activity not recorded'
      }
    );
  }, [trackActivity]);

  // Phase operations
  const trackPhaseCreate = useCallback(async (
    phaseId: string,
    phaseName: string,
    options?: ActivityTrackingOptions & {
      category?: string;
      description?: string;
      taskCount?: number;
    }
  ) => {
    return trackActivity(
      'phase_create',
      `New phase created: ${phaseName}`,
      `Project phase "${phaseName}" was added to the project`,
      {
        entityType: 'phase',
        entityId: phaseId,
        metadata: {
          phaseName,
          category: options?.category,
          description: options?.description,
          taskCount: options?.taskCount || 0
        },
        status: 'success',
        skipErrorBoundary: options?.skipErrorBoundary,
        fallbackMessage: options?.fallbackMessage || 'Phase created but activity not recorded'
      }
    );
  }, [trackActivity]);

  const trackPhaseUpdate = useCallback(async (
    phaseId: string,
    phaseName: string,
    options?: ActivityTrackingOptions & {
      description?: string;
      status?: string;
    }
  ) => {
    return trackActivity(
      'phase_update',
      `Phase updated: ${phaseName}`,
      `Project phase "${phaseName}" was modified`,
      {
        entityType: 'phase',
        entityId: phaseId,
        metadata: {
          phaseName,
          description: options?.description,
          status: options?.status
        },
        status: 'info',
        skipErrorBoundary: options?.skipErrorBoundary,
        fallbackMessage: options?.fallbackMessage || 'Phase updated but activity not recorded'
      }
    );
  }, [trackActivity]);

  const trackPhaseDelete = useCallback(async (
    phaseId: string,
    phaseName: string,
    options?: ActivityTrackingOptions
  ) => {
    return trackActivity(
      'phase_delete',
      `Phase removed: ${phaseName}`,
      `Project phase was deleted`,
      {
        entityType: 'phase',
        entityId: phaseId,
        metadata: { phaseName },
        status: 'warning',
        skipErrorBoundary: options?.skipErrorBoundary,
        fallbackMessage: options?.fallbackMessage || 'Phase deleted but activity not recorded'
      }
    );
  }, [trackActivity]);

  // Expense delete operation
  const trackExpenseDelete = useCallback(async (
    expenseId: string,
    expenseName: string,
    options?: ActivityTrackingOptions
  ) => {
    return trackActivity(
      'expense_delete',
      `Expense removed: ${expenseName}`,
      `Budget expense was deleted from the project`,
      {
        entityType: 'expense',
        entityId: expenseId,
        metadata: { expenseName },
        status: 'info',
        skipErrorBoundary: options?.skipErrorBoundary,
        fallbackMessage: options?.fallbackMessage || 'Expense deleted but activity not recorded'
      }
    );
  }, [trackActivity]);

  return {
    // Core tracking
    trackActivity,
    
    // Document operations
    trackDocumentUpload,
    trackDocumentDelete,
    
    // Financial operations
    trackExpenseCreate,
    trackExpenseDelete,
    trackBudgetUpdate,
    
    // Task operations
    trackTaskComplete,
    
    // Status operations
    trackStatusChange,
    
    // Team operations
    trackTeamMemberAdd,
    trackTeamMemberRemove,
    
    // Phase operations
    trackPhaseCreate,
    trackPhaseUpdate,
    trackPhaseDelete,
    
    // Utility
    getUserContext
  };
}