/**
 * Query hooks index for BuildEase construction management
 * Centralized exports for all Supabase query hooks
 */

// Project queries
export {
  useProject,
  useUserProjects,
  useProjectMembers,
} from './useProject';

// Projects page queries
export {
  useProjects,
  useProjectMetrics,
  useProjectsByStatus,
  useProjectSearch,
} from './useProjects';

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
  useDocument,
  useDocumentOperations,
  useMediaByCategory,
  useMediaByPhase,
  useProfileImage,
  useVirtualizedMedia,
  useInfiniteMedia,
  type MediaItem,
  type MediaFilters,
  type MediaStats,
  type UploadOptions,
} from '../useMedia';
