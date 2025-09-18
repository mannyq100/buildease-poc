/**
 * Application configuration
 * Contains environment-specific settings
 */

// API configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_SUPABASE_URL + '/rest/v1',
  timeout: 10000,
  withCredentials: false // Supabase REST API doesn't support credentials with CORS
};

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
