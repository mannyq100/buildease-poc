/**
 * Environment configuration utility for BuildEase
 * Centralizes access to environment variables and provides environment-specific configurations
 */

// Environment type definition
export type Environment = 'development' | 'staging' | 'production';

// Get current environment
export const getEnvironment = (): Environment => {
  return (import.meta.env.VITE_ENV as Environment) || 'development';
};

// Check if we're in a specific environment
export const isDevelopment = (): boolean => getEnvironment() === 'development';
export const isStaging = (): boolean => getEnvironment() === 'staging';
export const isProduction = (): boolean => getEnvironment() === 'production';

// Config interface
interface Config {
  apiUrl: string;
  appTitle: string;
  baseUrl: string;
  useMocks: boolean;
  analyticsId?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  oauthConfig: {
    googleClientId: string;
    facebookAppId: string;
    appleClientId: string;
  };
}

// Get environment configuration
export const getConfig = (): Config => {
  const env = getEnvironment();
  
  const baseConfig: Config = {
    apiUrl: import.meta.env.VITE_API_URL as string,
    appTitle: import.meta.env.VITE_APP_TITLE as string,
    baseUrl: import.meta.env.VITE_BASE_URL as string,
    useMocks: import.meta.env.VITE_USE_MOCK === 'true',
    analyticsId: import.meta.env.VITE_ANALYTICS_ID as string,
    logLevel: 'info',
    oauthConfig: {
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
      facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID as string,
      appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID as string,
    }
  };

  // Environment-specific overrides
  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        logLevel: 'debug',
      };
    case 'staging':
      return {
        ...baseConfig,
        logLevel: 'debug',
      };
    case 'production':
      return {
        ...baseConfig,
        logLevel: 'error',
        useMocks: false, // Always ensure mocks are disabled in production
      };
    default:
      return baseConfig;
  }
};

// Helper to log based on environment
export const logEnvironmentInfo = (): void => {
  const config = getConfig();
  const env = getEnvironment();
  
  console.log(`Running in ${env} environment`);
  
  if (isDevelopment()) {
    console.log('Environment Configuration:', {
      apiUrl: config.apiUrl,
      appTitle: config.appTitle,
      useMocks: config.useMocks,
      logLevel: config.logLevel
    });
  }
};

// Export default config
export default getConfig(); 