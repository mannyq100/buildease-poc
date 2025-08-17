/**
 * useTodaysFocus - Encapsulates urgency scoring and selection of today's focus tasks
 * Mobile-first: keeps computations minimal and memoized
 */

import { useCallback, useMemo } from 'react';
import type { TaskItem } from '../types';

export interface UseTodaysFocusOptions {
  limit?: number; // default 5
}

export function useTodaysFocus(allProjectTasks: TaskItem[] = [], options: UseTodaysFocusOptions = {}) {
  const { limit = 5 } = options;

  const getUrgencyScore = useCallback((task: TaskItem): number => {
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
  }, []);

  const todaysFocus = useMemo(() => {
    return allProjectTasks
      .filter((task) => {
        const s = task.status?.toUpperCase();
        return s !== 'COMPLETED' && s !== 'CANCELLED';
      })
      .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a))
      .slice(0, limit);
  }, [allProjectTasks, getUrgencyScore, limit]);

  return { todaysFocus, getUrgencyScore } as const;
}
