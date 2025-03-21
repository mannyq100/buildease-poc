/**
 * Types related to project phases and phase details integration
 */

// Base phase type used in ProjectDetails
export interface Phase {
  id: number;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning';
  budget: string;
  spent: string;
  description?: string;
}

// Extended phase type with more details
export interface PhaseDetail extends Phase {
  description: string;
  projectName: string;
  durationWeeks: number;
  teamSize: number;
  teamComposition: string;
}

// Task related to a phase
export interface Task {
  id: number;
  name: string;
  description?: string;
  dueDate: string;
  assignee?: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  phaseId: number;
}

// Material related to a phase
export interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  status: 'delivered' | 'ordered' | 'pending';
  expectedDelivery?: string;
  phaseId: number;
}

// Document related to a phase
export interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  uploader: string;
  phaseId: number;
}

// State for tracking expanded phase details
export interface PhaseExpansionState {
  expandedPhaseId: number | null;
  activeTab: 'overview' | 'tasks' | 'materials' | 'documents';
}

// Route parameters for deep linking
export interface PhaseRouteParams {
  projectId: string;
  phaseId?: string;
  tab?: 'overview' | 'tasks' | 'materials' | 'documents';
}
