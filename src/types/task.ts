/**
 * Task interface for project tasks
 */
export interface Task {
  id: number;
  name: string;
  description?: string;
  dueDate: string;
  assignee?: string;
  status: 'completed' | 'in-progress' | 'pending';
  phaseId: number;
  priority?: 'low' | 'medium' | 'high';
}
