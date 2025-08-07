/**
 * useAuditTracker Hook
 * React hook for tracking user activities and audit logging
 * Integrates with the audit service for automatic activity tracking
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { auditService, AUDIT_ACTIONS, type AuditContext, type AuditAction } from '@/services/auditService';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseAuditTrackerOptions {
  projectId?: string;
  enablePageTracking?: boolean;
  enableErrorTracking?: boolean;
  sessionId?: string;
}

interface UseAuditTrackerReturn {
  trackActivity: (
    action: AuditAction | string,
    options?: {
      entityType?: 'project' | 'phase' | 'task' | 'document' | 'comment' | 'expense' | 'team_member' | 'system';
      entityId?: string;
      description?: string;
      metadata?: Record<string, unknown>;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      complianceRelevant?: boolean;
      tags?: string[];
    }
  ) => Promise<void>;
  trackProjectActivity: (action: AuditAction | string, options?: Parameters<typeof trackActivity>[1]) => Promise<void>;
  trackDocumentActivity: (action: AuditAction | string, documentId: string, options?: Parameters<typeof trackActivity>[1]) => Promise<void>;
  trackUserActivity: (action: AuditAction | string, options?: Parameters<typeof trackActivity>[1]) => Promise<void>;
  isTracking: boolean;
}

export function useAuditTracker({
  projectId,
  enablePageTracking = true,
  enableErrorTracking = true,
  sessionId
}: UseAuditTrackerOptions = {}): UseAuditTrackerReturn {
  const { user } = useSupabaseAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const sessionIdRef = useRef(sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const lastPageRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(Date.now());
  const isTracking = !!user;

  // Create audit context
  const createAuditContext = useCallback((): AuditContext => {
    if (!user) {
      throw new Error('User must be authenticated to track activities');
    }

    return {
      user,
      projectId,
      sessionId: sessionIdRef.current,
      ipAddress: undefined, // Will be determined server-side if needed
      userAgent: navigator.userAgent,
      additionalMetadata: {
        current_page: location.pathname,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };
  }, [user, projectId, location.pathname]);

  // Track activity function
  const trackActivity = useCallback(async (
    action: AuditAction | string,
    options: Parameters<UseAuditTrackerReturn['trackActivity']>[1] = {}
  ) => {
    if (!user) return;

    try {
      const context = createAuditContext();
      await auditService.logActivity(action, context, options);
    } catch (error) {
      console.error('Failed to track activity:', error);
      // Don't throw - tracking should not break user flow
    }
  }, [user, createAuditContext]);

  // Specialized tracking functions
  const trackProjectActivity = useCallback(async (
    action: AuditAction | string, 
    options: Parameters<typeof trackActivity>[1] = {}
  ) => {
    await trackActivity(action, { 
      entityType: 'project', 
      entityId: projectId,
      ...options 
    });
  }, [trackActivity, projectId]);

  const trackDocumentActivity = useCallback(async (
    action: AuditAction | string,
    documentId: string,
    options: Parameters<typeof trackActivity>[1] = {}
  ) => {
    await trackActivity(action, { 
      entityType: 'document', 
      entityId: documentId,
      ...options 
    });
  }, [trackActivity]);

  const trackUserActivity = useCallback(async (
    action: AuditAction | string,
    options: Parameters<typeof trackActivity>[1] = {}
  ) => {
    await trackActivity(action, { 
      entityType: 'system',
      ...options 
    });
  }, [trackActivity]);

  // Track page navigation
  useEffect(() => {
    if (!enablePageTracking || !user) return;

    const currentPage = location.pathname;
    const pageStartTime = Date.now();

    // Track page view
    if (currentPage !== lastPageRef.current) {
      // Track time spent on previous page
      if (lastPageRef.current) {
        const timeSpent = pageStartTime - pageStartTimeRef.current;
        trackActivity('page.left', {
          entityType: 'system',
          description: `Left page ${lastPageRef.current}`,
          metadata: {
            page: lastPageRef.current,
            time_spent_ms: timeSpent,
            time_spent_seconds: Math.round(timeSpent / 1000)
          },
          severity: 'low'
        });
      }

      // Track new page view
      trackActivity('page.viewed', {
        entityType: 'system',
        description: `Viewed page ${currentPage}`,
        metadata: {
          page: currentPage,
          referrer: lastPageRef.current || document.referrer
        },
        severity: 'low'
      });

      lastPageRef.current = currentPage;
      pageStartTimeRef.current = pageStartTime;
    }
  }, [location.pathname, enablePageTracking, user, trackActivity]);

  // Track browser events
  useEffect(() => {
    if (!enablePageTracking || !user) return;

    const handleBeforeUnload = () => {
      if (lastPageRef.current) {
        const timeSpent = Date.now() - pageStartTimeRef.current;
        // Use sendBeacon for reliable tracking on page unload
        navigator.sendBeacon?.('/api/audit/track', JSON.stringify({
          action: 'session.ended',
          metadata: {
            page: lastPageRef.current,
            time_spent_ms: timeSpent,
            session_id: sessionIdRef.current
          }
        }));
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackActivity('page.hidden', {
          entityType: 'system',
          metadata: { page: location.pathname },
          severity: 'low'
        });
      } else {
        trackActivity('page.visible', {
          entityType: 'system',
          metadata: { page: location.pathname },
          severity: 'low'
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, location.pathname, enablePageTracking, trackActivity]);

  // Track errors
  useEffect(() => {
    if (!enableErrorTracking || !user) return;

    const handleError = (event: ErrorEvent) => {
      trackActivity('error.javascript', {
        entityType: 'system',
        description: `JavaScript error: ${event.message}`,
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          page: location.pathname
        },
        severity: 'medium'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackActivity('error.promise_rejection', {
        entityType: 'system',
        description: `Unhandled promise rejection: ${event.reason}`,
        metadata: {
          reason: event.reason?.toString(),
          page: location.pathname
        },
        severity: 'medium'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user, location.pathname, enableErrorTracking, trackActivity]);

  // Track authentication events
  useEffect(() => {
    if (user) {
      trackActivity(AUDIT_ACTIONS.USER_LOGIN, {
        entityType: 'system',
        description: 'User logged in',
        severity: 'medium',
        complianceRelevant: true
      });
    }

    return () => {
      if (user) {
        trackActivity(AUDIT_ACTIONS.USER_LOGOUT, {
          entityType: 'system',
          description: 'User logged out',
          severity: 'medium',
          complianceRelevant: true
        });
      }
    };
  }, [user?.id]); // Only trigger on user ID change

  return {
    trackActivity,
    trackProjectActivity,
    trackDocumentActivity,
    trackUserActivity,
    isTracking
  };
}

// Higher-order component for automatic activity tracking
export function withAuditTracking<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options: {
    trackComponentMount?: boolean;
    trackComponentUnmount?: boolean;
    componentName?: string;
  } = {}
) {
  const {
    trackComponentMount = true,
    trackComponentUnmount = false,
    componentName = Component.displayName || Component.name || 'Unknown'
  } = options;

  return function AuditTrackedComponent(props: T) {
    const { trackActivity } = useAuditTracker();

    useEffect(() => {
      if (trackComponentMount) {
        trackActivity('component.mounted', {
          entityType: 'system',
          description: `Component ${componentName} mounted`,
          metadata: { component: componentName },
          severity: 'low'
        });
      }

      return () => {
        if (trackComponentUnmount) {
          trackActivity('component.unmounted', {
            entityType: 'system',
            description: `Component ${componentName} unmounted`,
            metadata: { component: componentName },
            severity: 'low'
          });
        }
      };
    }, [trackActivity]);

    return <Component {...props} />;
  };
}

// Hook for tracking form interactions
export function useFormAuditTracker(formName: string) {
  const { trackActivity } = useAuditTracker();

  const trackFormStart = useCallback(() => {
    trackActivity('form.started', {
      entityType: 'system',
      description: `Started filling form: ${formName}`,
      metadata: { form_name: formName },
      severity: 'low'
    });
  }, [trackActivity, formName]);

  const trackFormSubmit = useCallback((success: boolean, errorMessage?: string) => {
    trackActivity(success ? 'form.submitted' : 'form.failed', {
      entityType: 'system',
      description: `${success ? 'Successfully submitted' : 'Failed to submit'} form: ${formName}`,
      metadata: { 
        form_name: formName, 
        success,
        error_message: errorMessage 
      },
      severity: success ? 'low' : 'medium'
    });
  }, [trackActivity, formName]);

  const trackFormAbandoned = useCallback(() => {
    trackActivity('form.abandoned', {
      entityType: 'system',
      description: `Abandoned form: ${formName}`,
      metadata: { form_name: formName },
      severity: 'low'
    });
  }, [trackActivity, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormAbandoned
  };
}