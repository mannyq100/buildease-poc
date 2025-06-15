/**
 * Centralized logging utility for production-safe logging
 * Ensures sensitive data is not logged in production
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log informational messages (development only)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log warnings (development and production)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment || this.isTest) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      // In production, log only essential warning info without sensitive data
      console.warn(`[WARN] ${message}`);
    }
  }

  /**
   * Log errors (development and production)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment || this.isTest) {
      console.error(`[ERROR] ${message}`, { error, ...context });
    } else {
      // In production, log only essential error info without sensitive data
      const sanitizedError = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ERROR] ${message}: ${sanitizedError}`);
    }
  }

  /**
   * Performance logging for optimization
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[PERF] ${operation}: ${duration}ms`, context);
    }
  }

  /**
   * User action tracking (development only)
   */
  userAction(action: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[USER] ${action}`, context);
    }
  }

  /**
   * API call logging (development only)
   */
  api(method: string, url: string, status?: number, duration?: number): void {
    if (this.isDevelopment) {
      console.log(`[API] ${method} ${url}`, { status, duration });
    }
  }

  /**
   * Storage operation logging (development only)
   */
  storage(operation: string, key: string, success: boolean, error?: unknown): void {
    if (this.isDevelopment) {
      if (success) {
        console.debug(`[STORAGE] ${operation} ${key}: success`);
      } else {
        console.warn(`[STORAGE] ${operation} ${key}: failed`, error);
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const { debug, info, warn, error, performance, userAction, api, storage } = logger;