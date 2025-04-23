/**
 * Domain utilities index
 * Provides organized access to domain-specific utility functions
 */

// Import and re-export with explicit namespaces to avoid naming conflicts
import * as ProjectUtils from './project';
import * as TeamUtils from './team';
import * as ScheduleUtils from './schedule';
import * as MaterialUtils from './material';
import * as FinanceUtils from './finance';

// Re-export as namespaced objects to avoid collisions
export { ProjectUtils, TeamUtils, ScheduleUtils, MaterialUtils, FinanceUtils };

// Selectively re-export non-conflicting functions for direct import
// Project utilities
export const {
  calculateCostEstimate,
  getTabProgress,
  isFormComplete,
  getTabsOrder,
  calculateProjectProgress,
  calculateDaysRemaining,
  getProjectDuration
} = ProjectUtils;

// Team utilities
export const {
  calculateAverageWorkload,
  filterTeamMembers,
  getInitials,
  getUniqueDepartments,
  getPerformanceColor,
  createNewTeamMember,
  getWorkloadStatus
} = TeamUtils;

// Schedule utilities
export const {
  getDaysRemaining,
  searchTasks,
  filterTasks,
  groupTasksByField,
  sortTasks,
  getNextTaskId,
  calculateCompletionPercentage,
  isTaskLate
} = ScheduleUtils;

// Material utilities
export const {
  calculateTotalCost,
  calculateTotalMaterialsCost,
  filterMaterials,
  groupMaterialsByField,
  getUniqueCategories,
  getUniqueSuppliers,
  sortMaterials,
  calculateMaterialsStats
} = MaterialUtils;

// Finance utilities
export const {
  formatCurrency,
  calculateVariance,
  calculateVariancePercentage,
  calculateProjectedCost,
  formatPercentage,
  groupBudgetByCategory,
  calculateBudgetPercentages,
  assignCategoryColors
} = FinanceUtils;
