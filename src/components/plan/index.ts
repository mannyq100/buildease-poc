/**
 * Plan Component Exports
 * This file exports all components from the plan directory
 * to provide a clean interface for importing throughout the application
 */

// Export the canonical modal manager implementation
export { PlanModalManager } from './PlanModalManager';
export type { PlanModalManagerHandlers } from './PlanModalManager';

// Export other plan components
export { ActionButtons } from './ActionButtons';
export { BudgetView } from './BudgetView';
export { DistributeModal } from './DistributeModal';
export { DocumentsView } from './DocumentsView';
export { MaterialsView } from './MaterialsView';
export { OverviewView } from './OverviewView';
export { PhaseCard } from './PhaseCard';
export { PlanActionBar } from './PlanActionBar';
export { PlanTabNavigation } from './PlanTabNavigation';
export { PlanViewRenderer } from './PlanViewRenderer';
export { default as ProjectOverview } from './ProjectOverview';
export { ProjectPhaseManager } from './ProjectPhaseManager';
export { default as ProjectPhases } from './ProjectPhases';
export { TeamView } from './TeamView';
export { TimelineView } from './TimelineView';
export { VirtualizedMaterialsTable } from './VirtualizedMaterialsTable';
export { VirtualizedTeamGrid } from './VirtualizedTeamGrid';
