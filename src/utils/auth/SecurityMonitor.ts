/**
 * Lightweight Security Monitor for BuildEase
 * 
 * Simplified security monitoring focused on essential authentication security
 * Optimized for construction management application needs
 */

import { logger } from '../core/logger';

interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
}

enum SecurityEventType {
  // Essential Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure', 
  SESSION_TIMEOUT = 'session_timeout',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
}

interface SecurityPolicy {
  maxFailedAttempts: number;
}

/**
 * Lightweight security monitoring system
 */
export class SecurityMonitor {
  private static instance: SecurityMonitor | null = null;
  private events: SecurityEvent[] = [];
  private failedAttempts: Map<string, number> = new Map();
  private policy: SecurityPolicy;
  
  private constructor() {
    this.policy = {
      maxFailedAttempts: 5,
    };
  }
  
  static getInstance(): SecurityMonitor {
    if (!this.instance) {
      this.instance = new SecurityMonitor();
    }
    return this.instance;
  }
  
  /**
   * Record a security event
   */
  recordEvent(
    type: SecurityEventType,
    severity: SecurityEvent['severity'],
    details: Record<string, any> = {}
  ): void {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      details,
      severity,
    };
    
    this.events.push(event);
    
    // Log based on severity
    if (severity === 'high') {
      logger.error(`Security Event: ${type}`, null, details);
    } else if (severity === 'medium') {
      logger.warn(`Security Event: ${type}`, details);
    } else {
      logger.debug(`Security Event: ${type}`, details);
    }
    
    // Handle immediate response for critical events
    if (type === SecurityEventType.MULTIPLE_FAILED_ATTEMPTS) {
      this.handleCriticalEvent(event);
    }
    
    // Keep only recent events (limit to 50 for lightweight operation)
    if (this.events.length > 50) {
      this.events = this.events.slice(-25);
    }
  }
  
  /**
   * Handle authentication failure and track failed attempts
   */
  handleAuthFailure(): void {
    const clientId = this.getClientIdentifier();
    const currentAttempts = this.failedAttempts.get(clientId) || 0;
    const newAttempts = currentAttempts + 1;
    
    this.failedAttempts.set(clientId, newAttempts);
    
    this.recordEvent(SecurityEventType.LOGIN_FAILURE, 'medium', {
      attemptNumber: newAttempts,
      clientId,
    });
    
    if (newAttempts >= this.policy.maxFailedAttempts) {
      this.recordEvent(SecurityEventType.MULTIPLE_FAILED_ATTEMPTS, 'high', {
        totalAttempts: newAttempts,
        clientId,
      });
      
      this.triggerSecurityLockout(clientId);
    }
  }
  
  private handleCriticalEvent(event: SecurityEvent): void {
    // Trigger security lockout for multiple failed attempts
    if (event.type === SecurityEventType.MULTIPLE_FAILED_ATTEMPTS) {
      const clientId = event.details.clientId;
      this.triggerSecurityLockout(clientId);
    }
  }
  
  private triggerSecurityLockout(clientId: string): void {
    // Dispatch event for auth system to handle
    window.dispatchEvent(new CustomEvent('securityLockoutTriggered', {
      detail: { clientId, reason: 'multiple_failed_attempts' }
    }));
  }
  
  private getClientIdentifier(): string {
    // Simple client identifier for tracking failed attempts
    return `${navigator.userAgent.substring(0, 30)}_${screen.width}x${screen.height}`;
  }
  /**
   * Record login success and reset failed attempts
   */
  recordLoginSuccess(): void {
    const clientId = this.getClientIdentifier();
    this.failedAttempts.delete(clientId);
    
    this.recordEvent(SecurityEventType.LOGIN_SUCCESS, 'low', {
      clientId,
    });
  }
  
  /**
   * Get recent security events for basic monitoring
   */
  getRecentEvents(timeWindowMs: number = 60 * 60 * 1000): SecurityEvent[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.events.filter(event => event.timestamp >= cutoff);
  }
  
  /**
   * Get basic security summary
   */
  getSecuritySummary(): {
    totalEvents: number;
    failedAttempts: number;
    lastEventTime: number;
  } {
    return {
      totalEvents: this.events.length,
      failedAttempts: Array.from(this.failedAttempts.values()).reduce((sum, count) => sum + count, 0),
      lastEventTime: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : 0,
    };
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();