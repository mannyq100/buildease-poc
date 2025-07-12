/**
 * Types related to project activities and notifications
 */

export type ActivityIcon = 
  | 'Package'
  | 'CheckSquare'
  | 'FileText'
  | 'Calendar'
  | 'Users'
  | 'MessageSquare';

export interface Activity {
  id: string;
  timestamp: string; // ISO 8601 date string
  title: string;
  description: string;
  icon: ActivityIcon;
  user: {
    name: string;
    avatarUrl?: string;
  };
  projectId: string;
}
