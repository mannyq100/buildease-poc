/**
 * Query hooks index for BuildEase construction management
 * Centralized exports for all Supabase query hooks
 */

// Project queries (removed - functionality moved to specialized hooks)

// Projects page queries (moved to useProjectSummary for consolidation)

// Project summary queries
export {
  useProjectSummary,
  useProjectSummaries,
  useAllProjectSummaries,
  useProjectMetrics,
  type ProjectSummaryFilters,
  type ProjectMetrics,
} from './useProjectSummary';

// Phase queries
export {
  useProjectPhases,
  usePhase,
  useCurrentPhase,
} from './usePhase';

// Task queries
export {
  useProjectTasks,
  usePhaseTasks,
  useTask,
  useMyTasks,
} from './useTask';

// Material queries
export {
  useProjectMaterials,
  useMaterial,
  useLowStockMaterials,
  useMaterialTransactions,
} from './useMaterial';

// Media queries (now using unified useMedia hook)
export {
  useMedia,
  useProjectDocuments,
  usePhaseDocuments,
  useMediaByCategory,
  useMediaByPhase,
  useProfileImage,
  type MediaItem,
  type MediaFilters,
  type MediaStats,
  type UploadOptions,
} from '../useMedia';
