/**
 * Plan Component Exports
 * This file exports all components from the plan directory
 * to provide a clean interface for importing throughout the application
 */

// Export the canonical modal manager implementation
export { PlanModalManager } from './PlanModalManager';
export type { PlanModalManagerHandlers } from './PlanModalManager';

// Export other plan components
export { default as AIRecommendations } from './AIRecommendations';
export { BudgetView } from './BudgetView';
export { DistributeModal } from './DistributeModal';
export { DocumentsView } from './DocumentsView';
export { MaterialsView } from './MaterialsView';
// Remove static exports that conflict with dynamic imports
// OverviewView and TimelineView are now only available via LazyViews
export { PhaseCard } from './PhaseCard';
export { PlanActionBar } from './PlanActionBar';
export { PlanTabNavigation } from './PlanTabNavigation';
export { PlanViewRenderer } from './PlanViewRenderer';
export { default as ProgressHeader } from './ProgressHeader';
export { default as ProjectOverview } from './ProjectOverview';
export { default as ProjectPhases } from './ProjectPhases';
export { default as RecommendationItem } from './RecommendationItem';
// TeamView static export removed for proper code splitting
export { VirtualizedMaterialsTable } from './VirtualizedMaterialsTable';
export { VirtualizedTeamGrid } from './VirtualizedTeamGrid';

// Export lazy loading utilities
export * from './LazyViews';
export * from './LoadingBoundary';

// Phase 3: Plan Status and Progress Tracking components
export { default as PlanProgressTracker } from './PlanProgressTracker';
export { default as PlanVersionManager } from './PlanVersionManager';
export { default as PlanStatusCard } from './PlanStatusCard';
export { default as PlanStatusDashboard } from './PlanStatusDashboard';

// Phase 4: Reverted - Use GeneratedPlan.tsx as source of truth for plan viewing
