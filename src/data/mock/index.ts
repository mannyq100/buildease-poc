/**
 * Mock Data Entry Point
 * Centralizes access to all mock data and services
 */

// Re-export all mock services
export * from './services/teamService';
export * from './services/projectService';
export * from './services/dashboardService';
export * from './services/taskService';
export * from './services/materialService';
export * from './services/authService';

// Export types of raw data
export type { default as MockData } from './types';
