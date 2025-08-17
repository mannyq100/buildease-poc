/**
 * Memoized Calculation Hooks
 * Sprint 2.3: Computation Optimization implementation
 * Prevents expensive recalculations on every render
 */

import { useMemo } from 'react';
import { toDbTaskStatus, toDbPhaseStatus } from '@/utils/core/dataNormalization';

// Types for calculation results
interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  overdue: number;
  progressPercentage: number;
}

interface PhaseMetrics {
  total: number;
  completed: number;
  inProgress: number;
  planning: number;
  paused: number;
  overallProgress: number;
  currentPhase?: {
    id: string;
    name: string;
    status: string;
  };
}

interface BudgetMetrics {
  allocated: number;
  spent: number;
  pending: number;
  approved: number;
  remaining: number;
  utilization: number;
  status: 'healthy' | 'warning' | 'critical' | 'over-budget';
  monthlyBurn?: number;
  projectedTotal?: number;
}

/**
 * Memoized task metrics calculation
 * Prevents expensive filtering and counting on every render
 */
export function useMemoizedTaskMetrics(tasks: Array<{ status: string; due_date?: string }>): TaskMetrics {
  return useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        blocked: 0,
        overdue: 0,
        progressPercentage: 0
      };
    }

    const now = new Date();
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let blocked = 0;
    let overdue = 0;

    // Single iteration through tasks for all calculations
    tasks.forEach(task => {
      const normalizedStatus = toDbTaskStatus(task.status);
      
      switch (normalizedStatus) {
        case 'COMPLETED':
          completed++;
          break;
        case 'IN_PROGRESS':
          inProgress++;
          break;
        case 'PENDING':
          pending++;
          break;
        case 'BLOCKED':
          blocked++;
          break;
      }

      // Check if task is overdue (not completed and past due date)
      if (normalizedStatus !== 'COMPLETED' && task.due_date) {
        const dueDate = new Date(task.due_date);
        if (dueDate < now) {
          overdue++;
        }
      }
    });

    const total = tasks.length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      overdue,
      progressPercentage
    };
  }, [tasks]);
}

/**
 * Memoized phase metrics calculation
 * Includes current phase detection and overall progress
 */
export function useMemoizedPhaseMetrics(phases: Array<{ 
  id: string; 
  name: string; 
  status: string; 
  timeline?: { 
    planned_start?: string; 
    planned_end?: string; 
    actual_start?: string; 
    actual_end?: string; 
  }; 
}>): PhaseMetrics {
  return useMemo(() => {
    if (!phases || phases.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        planning: 0,
        paused: 0,
        overallProgress: 0
      };
    }

    let completed = 0;
    let inProgress = 0;
    let planning = 0;
    let paused = 0;
    let currentPhase: PhaseMetrics['currentPhase'];

    // Single iteration for all phase metrics
    phases.forEach(phase => {
      const normalizedStatus = toDbPhaseStatus(phase.status);
      
      switch (normalizedStatus) {
        case 'COMPLETED':
          completed++;
          break;
        case 'IN_PROGRESS':
          inProgress++;
          // Set as current phase if not already set
          if (!currentPhase) {
            currentPhase = {
              id: phase.id,
              name: phase.name,
              status: phase.status
            };
          }
          break;
        case 'PLANNING':
          planning++;
          // Set as current phase if no in-progress phase found
          if (!currentPhase) {
            currentPhase = {
              id: phase.id,
              name: phase.name,
              status: phase.status
            };
          }
          break;
        case 'PAUSED':
          paused++;
          break;
      }
    });

    const total = phases.length;
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      planning,
      paused,
      overallProgress,
      currentPhase
    };
  }, [phases]);
}

/**
 * Memoized budget metrics calculation
 * Includes health status and projections
 */
export function useMemoizedBudgetMetrics(
  expenses: Array<{ 
    amount: number; 
    base_amount?: number; 
    payment_status: string; 
    created_at?: string; 
  }>,
  projectBudget: number = 0
): BudgetMetrics {
  return useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        allocated: projectBudget,
        spent: 0,
        pending: 0,
        approved: 0,
        remaining: projectBudget,
        utilization: 0,
        status: 'healthy',
        monthlyBurn: 0,
        projectedTotal: projectBudget
      };
    }

    let spent = 0;
    let pending = 0;
    let approved = 0;
    const expenseAmounts: number[] = [];
    const expenseDates: Date[] = [];

    // Single iteration for all budget calculations
    expenses.forEach(expense => {
      const amount = expense.base_amount || expense.amount;
      
      switch (expense.payment_status.toUpperCase()) {
        case 'PAID':
        case 'COMPLETED':
          spent += amount;
          break;
        case 'PENDING':
          pending += amount;
          break;
        case 'APPROVED':
          approved += amount;
          break;
      }

      // Collect data for burn rate calculation
      if (expense.created_at) {
        expenseAmounts.push(amount);
        expenseDates.push(new Date(expense.created_at));
      }
    });

    const allocated = projectBudget || (spent + pending + approved);
    const remaining = allocated - spent;
    const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;

    // Determine budget health status
    let status: BudgetMetrics['status'];
    if (utilization > 100) {
      status = 'over-budget';
    } else if (utilization > 90) {
      status = 'critical';
    } else if (utilization > 75) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    // Calculate monthly burn rate (if we have at least 2 expenses with dates)
    let monthlyBurn = 0;
    let projectedTotal = allocated;
    
    if (expenseDates.length >= 2) {
      const sortedDates = [...expenseDates].sort((a, b) => a.getTime() - b.getTime());
      const firstDate = sortedDates[0];
      const lastDate = sortedDates[sortedDates.length - 1];
      const timeSpanDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (timeSpanDays > 0) {
        const dailyBurn = spent / timeSpanDays;
        monthlyBurn = dailyBurn * 30; // Approximate monthly burn
        
        // Project total based on burn rate (rough estimate)
        const today = new Date();
        const projectAgeMonths = (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (projectAgeMonths > 0) {
          const estimatedMonthsToComplete = projectAgeMonths * 2; // Rough estimate
          projectedTotal = Math.max(allocated, monthlyBurn * estimatedMonthsToComplete);
        }
      }
    }

    return {
      allocated,
      spent,
      pending,
      approved,
      remaining,
      utilization: Math.round(utilization * 100) / 100, // Round to 2 decimal places
      status,
      monthlyBurn: Math.round(monthlyBurn),
      projectedTotal: Math.round(projectedTotal)
    };
  }, [expenses, projectBudget]);
}

/**
 * Memoized timeline calculations
 * Handles date parsing and validation efficiently
 */
export function useMemoizedTimelineMetrics(phases: Array<{
  timeline?: {
    planned_start?: string;
    planned_end?: string;
    actual_start?: string;
    actual_end?: string;
  };
}>) {
  return useMemo(() => {
    if (!phases || phases.length === 0) {
      return {
        projectStart: null,
        projectEnd: null,
        actualStart: null,
        actualEnd: null,
        isOnTrack: true,
        daysRemaining: null,
        completionPercentage: 0
      };
    }

    const startDates: Date[] = [];
    const endDates: Date[] = [];
    const actualStartDates: Date[] = [];
    const actualEndDates: Date[] = [];

    // Parse all dates in single iteration
    phases.forEach(phase => {
      const timeline = phase.timeline;
      if (!timeline) return;

      // Planned dates
      if (timeline.planned_start) {
        const date = new Date(timeline.planned_start);
        if (!isNaN(date.getTime())) {
          startDates.push(date);
        }
      }
      
      if (timeline.planned_end) {
        const date = new Date(timeline.planned_end);
        if (!isNaN(date.getTime())) {
          endDates.push(date);
        }
      }

      // Actual dates
      if (timeline.actual_start) {
        const date = new Date(timeline.actual_start);
        if (!isNaN(date.getTime())) {
          actualStartDates.push(date);
        }
      }
      
      if (timeline.actual_end) {
        const date = new Date(timeline.actual_end);
        if (!isNaN(date.getTime())) {
          actualEndDates.push(date);
        }
      }
    });

    // Sort dates properly (not as strings)
    startDates.sort((a, b) => a.getTime() - b.getTime());
    endDates.sort((a, b) => a.getTime() - b.getTime());
    actualStartDates.sort((a, b) => a.getTime() - b.getTime());
    actualEndDates.sort((a, b) => a.getTime() - b.getTime());

    const projectStart = startDates[0] || null;
    const projectEnd = endDates[endDates.length - 1] || null;
    const actualStart = actualStartDates[0] || null;
    const actualEnd = actualEndDates[actualEndDates.length - 1] || null;

    // Calculate if project is on track
    const today = new Date();
    let isOnTrack = true;
    let daysRemaining: number | null = null;
    let completionPercentage = 0;

    if (projectStart && projectEnd) {
      const totalProjectDays = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
      daysRemaining = Math.ceil((projectEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (totalProjectDays > 0) {
        const daysPassed = (today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
        completionPercentage = Math.max(0, Math.min(100, (daysPassed / totalProjectDays) * 100));
      }

      // Simple on-track calculation: if we're past the end date and not 100% complete
      if (today > projectEnd && completionPercentage < 100) {
        isOnTrack = false;
      }
    }

    return {
      projectStart,
      projectEnd,
      actualStart,
      actualEnd,
      isOnTrack,
      daysRemaining,
      completionPercentage: Math.round(completionPercentage)
    };
  }, [phases]);
}

/**
 * Composite hook that combines all metrics for a project dashboard
 * Memoized for optimal performance
 */
export function useMemoizedProjectMetrics(
  phases: any[],
  tasks: any[],
  expenses: any[],
  projectBudget: number = 0
) {
  const taskMetrics = useMemoizedTaskMetrics(tasks);
  const phaseMetrics = useMemoizedPhaseMetrics(phases);
  const budgetMetrics = useMemoizedBudgetMetrics(expenses, projectBudget);
  const timelineMetrics = useMemoizedTimelineMetrics(phases);

  // Combine all metrics into a single object
  return useMemo(() => ({
    tasks: taskMetrics,
    phases: phaseMetrics,
    budget: budgetMetrics,
    timeline: timelineMetrics,
    
    // Overall project health score (0-100)
    healthScore: Math.round(
      (
        (taskMetrics.progressPercentage * 0.3) +  // 30% weight on task completion
        (phaseMetrics.overallProgress * 0.3) +     // 30% weight on phase completion
        ((budgetMetrics.status === 'healthy' ? 100 : 
          budgetMetrics.status === 'warning' ? 75 : 
          budgetMetrics.status === 'critical' ? 50 : 25) * 0.25) + // 25% weight on budget health
        ((timelineMetrics.isOnTrack ? 100 : 50) * 0.15) // 15% weight on timeline adherence
      )
    )
  }), [taskMetrics, phaseMetrics, budgetMetrics, timelineMetrics]);
}