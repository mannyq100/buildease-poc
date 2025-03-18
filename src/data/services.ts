/**
 * Centralized export for all data services
 * This file serves as a single entry point for importing data services
 */

// Re-export all dashboard services
export {
  getProjectProgressData,
  getBudgetData,
  getMaterialUsageData,
  getTaskStatusData,
  getQuickStats,
  getQuickActions,
  getNavItems
} from './mock/dashboard/dashboardService';

// Re-export team services
export {
  getAllTeamMembers,
  getTeamMembersByRole,
  getTeamSummary,
  getTeamPerformance
} from './teamService';

// Re-export project services
export {
  getAllProjects,
  getProjectById,
  getProjectsCount,
  getProjectsByStatus,
  getRecentProjects
} from './projectsData';

// Import schedule data
export {
  getScheduleData,
  getTasks,
  getMilestones,
  getTasksByStatus
} from './scheduleData'; 