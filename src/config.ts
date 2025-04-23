/**
 * Application configuration
 * Contains feature flags and environment-specific settings
 */

// API configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true
};

// Feature flags for API usage
// Set to true to use real API, false to use mock data
export const USE_MOCK_API: Record<string, boolean> = {
  team: true,
  projects: true,
  dashboard: true,
  tasks: true,
  materials: true,
  auth: true,
};

// Default to mock in development, real in production
export const DEFAULT_TO_MOCK = import.meta.env.DEV;

// Configuration for specific features
export const FEATURE_CONFIG = {
  dashboard: {
    refreshInterval: 60000, // 1 minute
  },
  projects: {
    pageSize: 10,
  },
  team: {
    pageSize: 20,
  },
};
