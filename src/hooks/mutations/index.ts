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

// Phase mutations (unified)
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

// Task assignment mutations
export {
  useAssignTask as useTaskAssignment,
  useBulkAssignTasks,
  useTaskAssignmentStats
} from './useTaskAssignment';

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

// ProjectDetails specific phase mutations (unified)
export {
  useCreateProjectDetailsPhase,
  useUpdateProjectDetailsPhase,
  useDeleteProjectDetailsPhase,
  useProjectDetailsPhases
} from './usePhase';

// Re-export types for convenience
export type { CreateProjectData, UpdateProjectData } from './useProject';
export type { CreatePhaseData, UpdatePhaseData, CreatePhaseUIData, UpdatePhaseUIData, PhaseResponse } from './usePhase';
export type { BudgetExpense, CreateBudgetExpenseData, UpdateBudgetExpenseData } from './useBudget';
export type { TeamMember, CreateTeamMemberData, UpdateTeamMemberData } from './useTeamMember';
export type { ProjectDetailsPhase, CreateProjectDetailsPhaseData, UpdateProjectDetailsPhaseData } from './usePhase';
export type { CreateTaskData, UpdateTaskData } from './useTask';
export type { AssignTaskData, BulkAssignTasksData } from './useTaskAssignment';
export type { CreateMaterialData, UpdateMaterialData, MaterialTransactionData } from './useMaterial';
