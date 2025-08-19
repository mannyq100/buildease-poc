/**
 * useTodaysFocus - OPTIMIZED: Uses server-side urgency calculations
 * Eliminates heavy client-side computations by leveraging database views
 * Mobile-first: no client-side calculations, uses pre-computed server data
 */

import { useCallback, useMemo } from 'react';
import { useProjectTodaysFocus } from '@/hooks/queries/useTodaysFocusOptimized';
import type { TaskItem } from '../types';

export interface UseTodaysFocusOptions {
  limit?: number; // default 5
}

/**
 * DEPRECATED: Client-side urgency calculation (kept for backward compatibility)
 * Use server-side calculation from database views instead
 */
function getClientSideUrgencyScore(task: TaskItem): number {
  let score = 0;

  const priority = task.priority?.toUpperCase();
  const priorityScores: Record<string, number> = { URGENT: 100, HIGH: 75, MEDIUM: 50, LOW: 25 };
  score += priority ? (priorityScores[priority] ?? 25) : 25;

  const status = task.status?.toUpperCase();
  if (status === 'BLOCKED') score += 30;
  else if (status === 'IN_PROGRESS') score += 20;

  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) score += 25;
    else if (daysUntilDue === 0) score += 20;
    else if (daysUntilDue === 1) score += 15;
    else if (daysUntilDue <= 3) score += 10;
    else if (daysUntilDue <= 7) score += 5;
  }

  return score;
}

/**
 * Optimized Today's Focus Hook
 * Uses server-side calculations when projectId is available, falls back to client-side for compatibility
 */
export function useTodaysFocus(
  allProjectTasks: TaskItem[] = [], 
  options: UseTodaysFocusOptions & { projectId?: string } = {}
) {
  const { limit = 5, projectId } = options;

  // Use server-side optimized hook when projectId is available
  const { data: serverTodaysFocus, isLoading } = useProjectTodaysFocus(
    projectId || '', 
    limit
  );
  
  // Don't use server data if projectId is empty/undefined
  const shouldUseServerData = projectId && serverTodaysFocus && !isLoading;

  // Memoized client-side urgency calculation (fallback)
  const getUrgencyScore = useCallback((task: TaskItem): number => {
    return getClientSideUrgencyScore(task);
  }, []);

  // Memoized client-side today's focus calculation (fallback)
  const clientTodaysFocus = useMemo(() => {
    return allProjectTasks
      .filter((task) => {
        const s = task.status?.toUpperCase();
        return s !== 'COMPLETED' && s !== 'CANCELLED';
      })
      .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a))
      .slice(0, limit);
  }, [allProjectTasks, getUrgencyScore, limit]);

  // Use server-side data when available and project ID is provided
  const todaysFocus = useMemo(() => {
    if (shouldUseServerData) {
      // Transform server data to match TaskItem interface
      return serverTodaysFocus.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED',
        priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        due_date: task.due_date,
        phase_id: task.phase_id,
        // Add optional fields that might be expected
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        created_at: task.created_at,
        updated_at: task.updated_at,
        description: task.description || '',
        // Include server-calculated optimization data as extra properties
        urgency_score: task.urgency_score,
        focus_category: task.focus_category
      })) as (TaskItem & { 
        project_id?: string; 
        assigned_to?: string; 
        created_at?: string; 
        updated_at?: string; 
        description?: string;
        urgency_score?: number;
        focus_category?: string;
      })[];
    }
    
    // Fallback to client-side calculation
    return clientTodaysFocus;
  }, [shouldUseServerData, serverTodaysFocus, clientTodaysFocus]);

  return { todaysFocus, getUrgencyScore } as const;
}
