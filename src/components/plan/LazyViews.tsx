/**
 * Lazy Views
 * Code-split view components for better performance
 * Each view is loaded only when needed
 */

import { lazy } from 'react';

// Lazy load all plan view components
export const LazyOverviewView = lazy(() => 
  import('./OverviewView').then(module => ({ default: module.OverviewView }))
);

export const LazyTimelineView = lazy(() => 
  import('./TimelineView').then(module => ({ default: module.TimelineView }))
);

export const LazyMaterialsView = lazy(() => 
  import('./MaterialsView').then(module => ({ default: module.MaterialsView }))
);

export const LazyBudgetView = lazy(() => 
  import('./BudgetView').then(module => ({ default: module.BudgetView }))
);

export const LazyTeamView = lazy(() => 
  import('./TeamView').then(module => ({ default: module.TeamView }))
);

export const LazyDocumentsView = lazy(() => 
  import('./DocumentsView').then(module => ({ default: module.DocumentsView }))
);

// Preload views that are likely to be used
export const preloadViews = {
  overview: () => import('./OverviewView'),
  timeline: () => import('./TimelineView'),
  materials: () => import('./MaterialsView'),
  budget: () => import('./BudgetView'),
  team: () => import('./TeamView'),
  documents: () => import('./DocumentsView')
};

// Preload the most commonly used views
export const preloadCommonViews = () => {
  // Preload overview and timeline as they're most commonly accessed
  preloadViews.overview();
  preloadViews.timeline();
};

// View type definitions for type safety
export type ViewType = 'overview' | 'timeline' | 'materials' | 'budget' | 'team' | 'documents';

export const VIEW_COMPONENTS = {
  overview: LazyOverviewView,
  timeline: LazyTimelineView,
  materials: LazyMaterialsView,
  budget: LazyBudgetView,
  team: LazyTeamView,
  documents: LazyDocumentsView
} as const;