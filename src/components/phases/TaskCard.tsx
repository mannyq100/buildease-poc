import React from 'react';
import { TaskCard as SharedTaskCard } from '@/components/shared/TaskCard';
import type { Task } from '@/types/schedule';

/**
 * Phase-specific TaskCard component that uses the unified TaskCard implementation
 * while following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look
 */
export interface PhaseTaskCardProps {
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  priority?: 'high' | 'medium' | 'low';
  assignees?: Array<{
    id: number;
    name: string;
    avatar: string | null;
  }>;
  comments?: number;
  attachments?: number;
}

export function TaskCard({
  title,
  description,
  dueDate,
  status,
  priority = 'medium',
  assignees = [],
  comments = 0,
  attachments = 0
}: PhaseTaskCardProps) {
  return (
    <SharedTaskCard
      title={title}
      description={description}
      dueDate={dueDate}
      status={status}
      priority={priority}
      assignees={assignees}
      comments={comments}
      attachments={attachments}
      animate={true}
    />
  );
}