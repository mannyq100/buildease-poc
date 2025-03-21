/**
 * Interface for project updates
 */
export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: 'progress' | 'issue' | 'milestone' | 'general';
  createdAt: string;
  createdBy: string;
  attachments?: string[];
}
