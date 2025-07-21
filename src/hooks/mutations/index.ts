// Project mutations
export {
  useCreateProject,
  useUpdateProject,
  useUpdateProjectStatus,
  useDeleteProject,
  useAddProjectMember,
  useRemoveProjectMember,
  useUpdateProjectMemberRole
} from './useProject';

// Project CRUD mutations for Projects page
export {
  useCreateProject as useCreateProjectCRUD,
  useUpdateProject as useUpdateProjectCRUD,
  useDeleteProject as useDeleteProjectCRUD,
  useDuplicateProject,
  useUpdateProjectStatus as useUpdateProjectStatusCRUD
} from './useProjectCRUD';

// Phase mutations
export {
  useCreatePhase,
  useUpdatePhase,
  useDeletePhase,
  useReorderPhases
} from './usePhase';

// Task mutations
export {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask
} from './useTask';

// Material mutations
export {
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  useCreateMaterialTransaction,
  useUpdateMaterialStatus,
  useBulkUpdateMaterials
} from './useMaterial';

// Budget mutations for ProjectDetails
export {
  useCreateBudgetExpense,
  useUpdateBudgetExpense,
  useDeleteBudgetExpense,
  useProjectBudgetExpenses
} from './useBudget';

// Team member mutations for ProjectDetails
export {
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useProjectTeamMembers
} from './useTeamMember';

// ProjectDetails specific phase mutations
export {
  useCreateProjectDetailsPhase,
  useUpdateProjectDetailsPhase,
  useDeleteProjectDetailsPhase,
  useProjectDetailsPhases
} from './useProjectDetailsPhase';

// Re-export types for convenience
export type { CreateProjectData, UpdateProjectData } from './useProject';
export type { CreatePhaseData, UpdatePhaseData } from './usePhase';
export type { BudgetExpense, CreateBudgetExpenseData, UpdateBudgetExpenseData } from './useBudget';
export type { TeamMember, CreateTeamMemberData, UpdateTeamMemberData } from './useTeamMember';
export type { ProjectDetailsPhase, CreateProjectDetailsPhaseData, UpdateProjectDetailsPhaseData } from './useProjectDetailsPhase';
export type { CreateTaskData, UpdateTaskData } from './useTask';
export type { CreateMaterialData, UpdateMaterialData, MaterialTransactionData } from './useMaterial';
