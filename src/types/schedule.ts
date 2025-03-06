// Define task type
export interface Task {
  id: number;
  title: string;
  description: string;
  project: string;
  phase: string;
  startDate: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: TeamMember[];
  completion: number;
  dependencies?: number[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

// Define team member type
export interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  role: string;
  department?: string;
}

// Define task comment type
export interface TaskComment {
  id: number;
  author: TeamMember;
  text: string;
  date: string;
}

// Define task attachment type
export interface TaskAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: TeamMember;
  uploadDate: string;
}

// Define task dependency type
export interface TaskDependency {
  id: number;
  fromTask: number;
  toTask: number;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

// Define new task form type
export interface NewTaskForm {
  id?: number; // Optional ID for editing existing tasks
  title: string;
  description: string;
  project: string;
  phase: string;
  startDate: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: number[]; // Array of team member IDs
  completion?: number; // Optional completion percentage
  dependencies?: number[]; // Optional array of dependency task IDs
}

// Define task metrics type
export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  delayed: number;
  blocked: number;
  notStarted: number;
  overallCompletion: number;
  highPriorityCompletion: number;
  mediumPriorityCompletion: number;
  lowPriorityCompletion: number;
}

// Define view mode type
export type ViewMode = 'tasks' | 'calendar' | 'metrics';

// Define task view layout type
export type TaskViewLayout = 'grid' | 'list'; 