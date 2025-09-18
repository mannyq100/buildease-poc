/**
 * Enhanced Audit Service for BuildEase
 * Comprehensive activity tracking with full context, metadata, and compliance features
 * Designed for construction project compliance and regulatory requirements
 */

import { supabase } from '@/lib/supabase';
import { getUserDisplayName } from '@/utils/projectUtils';
import { websocketService } from '@/services/websocketService';
import type { User } from '@supabase/supabase-js';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  project_id?: string;
  entity_type: 'project' | 'phase' | 'task' | 'document' | 'comment' | 'expense' | 'team_member' | 'system';
  entity_id?: string;
  action: string;
  action_category: 'create' | 'read' | 'update' | 'delete' | 'auth' | 'collaboration' | 'system';
  description: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  compliance_relevant: boolean;
  created_at: string;
  // Computed fields
  risk_score?: number;
  tags?: string[];
}

export interface AuditContext {
  user: User;
  projectId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  additionalMetadata?: Record<string, unknown>;
}

export interface AuditFilters {
  projectId?: string;
  userId?: string;
  entityType?: AuditLogEntry['entity_type'];
  actionCategory?: AuditLogEntry['action_category'];
  severity?: AuditLogEntry['severity'];
  complianceRelevant?: boolean;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  entriesByUser: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  complianceEntries: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  topActions: Array<{
    action: string;
    count: number;
  }>;
  riskMetrics: {
    averageRiskScore: number;
    highRiskEntries: number;
    criticalEntries: number;
  };
}

// Pre-defined action templates for consistency
export const AUDIT_ACTIONS = {
  // Project actions
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_ARCHIVED: 'project.archived',
  PROJECT_SHARED: 'project.shared',
  
  // Phase actions
  PHASE_CREATED: 'phase.created',
  PHASE_UPDATED: 'phase.updated',
  PHASE_DELETED: 'phase.deleted',
  PHASE_COMPLETED: 'phase.completed',
  
  // Task actions
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_COMPLETED: 'task.completed',
  TASK_ASSIGNED: 'task.assigned',
  
  // Document actions
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_UPDATED: 'document.updated',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_DOWNLOADED: 'document.downloaded',
  DOCUMENT_SHARED: 'document.shared',
  
  // Comment actions
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
  
  // Expense actions
  EXPENSE_CREATED: 'expense.created',
  EXPENSE_UPDATED: 'expense.updated',
  EXPENSE_DELETED: 'expense.deleted',
  EXPENSE_APPROVED: 'expense.approved',
  EXPENSE_REJECTED: 'expense.rejected',
  
  // Team actions
  TEAM_MEMBER_ADDED: 'team.member_added',
  TEAM_MEMBER_REMOVED: 'team.member_removed',
  TEAM_ROLE_CHANGED: 'team.role_changed',
  
  // Auth actions
  USER_LOGIN: 'auth.login',
  USER_LOGOUT: 'auth.logout',
  USER_REGISTERED: 'auth.registered',
  PASSWORD_CHANGED: 'auth.password_changed',
  
  // Collaboration actions
  COLLABORATION_JOINED: 'collab.joined',
  COLLABORATION_LEFT: 'collab.left',
  REAL_TIME_COMMENT: 'collab.comment',
  CURSOR_SHARED: 'collab.cursor_shared',
  
  // System actions
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  DATA_EXPORT: 'system.data_export',
  COMPLIANCE_REPORT: 'system.compliance_report'
} as const;

type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

class AuditService {
  private batchQueue: AuditLogEntry[] = [];
  private batchTimer?: NodeJS.Timeout;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_INTERVAL = 5000; // 5 seconds
  private isDestroyed = false;
  
  /**
   * Log a single audit entry
   */
  async logActivity(
    action: AuditAction | string,
    context: AuditContext,
    options: {
      entityType?: AuditLogEntry['entity_type'];
      entityId?: string;
      description?: string;
      metadata?: Record<string, unknown>;
      severity?: AuditLogEntry['severity'];
      complianceRelevant?: boolean;
      tags?: string[];
    } = {}
  ): Promise<void> {
    try {
      const entry: Omit<AuditLogEntry, 'id' | 'created_at'> = {
        user_id: context.user.id,
        user_name: getUserDisplayName({ user: context.user } as any),
        user_email: context.user.email,
        project_id: context.projectId,
        entity_type: options.entityType || 'system',
        entity_id: options.entityId,
        action,
        action_category: this.categorizeAction(action),
        description: options.description || this.generateDescription(action, context, options),
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: context.userAgent || this.getBrowserInfo(),
          ip_address: context.ipAddress,
          session_id: context.sessionId || this.generateSessionId(),
          ...context.additionalMetadata,
          ...options.metadata
        },
        ip_address: context.ipAddress,
        user_agent: context.userAgent || this.getBrowserInfo(),
        session_id: context.sessionId || this.generateSessionId(),
        severity: options.severity || this.calculateSeverity(action),
        compliance_relevant: options.complianceRelevant ?? this.isComplianceRelevant(action),
        risk_score: this.calculateRiskScore(action, options.severity || 'low'),
        tags: options.tags || this.generateTags(action, options.entityType)
      };

      // Add to batch queue for efficient processing
      this.addToBatch(entry as AuditLogEntry);
      
      // Broadcast to real-time collaboration if relevant
      if (context.projectId && this.shouldBroadcast(action)) {
        this.broadcastActivity(entry as AuditLogEntry, context.projectId);
      }

    } catch (error) {
      console.error('Failed to log audit activity:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log multiple activities in batch
   */
  async logBulkActivity(
    entries: Array<{
      action: AuditAction | string;
      context: AuditContext;
      options?: Parameters<typeof this.logActivity>[2];
    }>
  ): Promise<void> {
    const promises = entries.map(({ action, context, options }) =>
      this.logActivity(action, context, options)
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Retrieve audit logs with filtering
   */
  async getAuditLogs(filters: AuditFilters = {}): Promise<{
    data: AuditLogEntry[];
    totalCount: number;
  }> {
    try {
      let query = supabase
        .from('be_project_activity')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      
      if (filters.actionCategory) {
        query = query.eq('action_category', filters.actionCategory);
      }
      
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      
      if (filters.complianceRelevant !== undefined) {
        query = query.eq('compliance_relevant', filters.complianceRelevant);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      if (filters.searchTerm) {
        query = query.or(`description.ilike.%${filters.searchTerm}%,action.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.tags?.length) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        totalCount: count || 0
      };

    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  /**
   * Generate audit summary and analytics
   */
  async getAuditSummary(filters: Omit<AuditFilters, 'limit' | 'offset'> = {}): Promise<AuditSummary> {
    try {
      const { data: allEntries } = await this.getAuditLogs({ ...filters, limit: 10000 });

      const summary: AuditSummary = {
        totalEntries: allEntries.length,
        entriesByCategory: {},
        entriesByUser: {},
        entriesBySeverity: {},
        complianceEntries: 0,
        dateRange: {
          earliest: '',
          latest: ''
        },
        topActions: [],
        riskMetrics: {
          averageRiskScore: 0,
          highRiskEntries: 0,
          criticalEntries: 0
        }
      };

      if (allEntries.length === 0) {
        return summary;
      }

      // Process entries
      const actionCounts: Record<string, number> = {};
      let totalRiskScore = 0;

      allEntries.forEach(entry => {
        // Count by category
        summary.entriesByCategory[entry.action_category] = 
          (summary.entriesByCategory[entry.action_category] || 0) + 1;

        // Count by user
        summary.entriesByUser[entry.user_name] = 
          (summary.entriesByUser[entry.user_name] || 0) + 1;

        // Count by severity
        summary.entriesBySeverity[entry.severity] = 
          (summary.entriesBySeverity[entry.severity] || 0) + 1;

        // Count compliance entries
        if (entry.compliance_relevant) {
          summary.complianceEntries++;
        }

        // Count actions
        actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;

        // Risk metrics
        totalRiskScore += entry.risk_score || 0;
        if (entry.severity === 'high') {
          summary.riskMetrics.highRiskEntries++;
        }
        if (entry.severity === 'critical') {
          summary.riskMetrics.criticalEntries++;
        }
      });

      // Calculate metrics
      summary.riskMetrics.averageRiskScore = totalRiskScore / allEntries.length;
      
      // Date range
      const sortedByDate = allEntries.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      summary.dateRange.earliest = sortedByDate[0]?.created_at || '';
      summary.dateRange.latest = sortedByDate[sortedByDate.length - 1]?.created_at || '';

      // Top actions
      summary.topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return summary;

    } catch (error) {
      console.error('Failed to generate audit summary:', error);
      throw new Error('Failed to generate audit summary');
    }
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(
    filters: AuditFilters,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const { data } = await this.getAuditLogs({ ...filters, limit: 100000 });

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return JSON.stringify(data, null, 2);

    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  /**
   * Delete old audit logs based on retention policy
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { count, error } = await supabase
        .from('be_project_activity')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      return count || 0;

    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
      throw new Error('Failed to cleanup old audit logs');
    }
  }

  // Private helper methods

  private addToBatch(entry: AuditLogEntry): void {
    if (this.isDestroyed) return;
    
    this.batchQueue.push(entry);

    if (this.batchQueue.length >= this.BATCH_SIZE) {
      this.processBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.processBatch(), this.BATCH_INTERVAL);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0 || this.isDestroyed) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    try {
      // Filter out entries without valid project_id to comply with RLS policy
      const validEntries = batch.filter(entry => entry.project_id && entry.project_id.trim() !== '');
      
      if (validEntries.length === 0) {
        console.log('No valid project entries to audit - skipping batch');
        return;
      }
      
      // Transform audit entries to match database schema
      const transformedBatch = validEntries.map(entry => ({
        project_id: entry.project_id,
        activity_type: entry.action, // Map action to activity_type
        title: entry.description || entry.action,
        description: entry.description,
        user_id: entry.user_id,
        user_name: entry.user_name,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        metadata: {
          ...entry.metadata,
          action_category: entry.action_category,
          severity: entry.severity,
          compliance_relevant: entry.compliance_relevant,
          risk_score: entry.risk_score,
          tags: entry.tags,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          session_id: entry.session_id,
          user_email: entry.user_email
        },
        status: this.mapSeverityToStatus(entry.severity)
      }));

      const { error } = await supabase
        .from('be_project_activity')
        .insert(transformedBatch);

      if (error) {
        console.error('Failed to insert audit batch:', error);
        
        // If RLS policy violation, log a warning but don't fail
        if (error.code === '42501') {
          console.warn('Audit logging blocked by RLS policy - user may not be a project member');
        }
        // Could implement retry logic here
      }

    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }

  private mapSeverityToStatus(severity: AuditLogEntry['severity']): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'info';
      default: return 'info';
    }
  }

  /**
   * Cleanup method to prevent memory leaks
   * Should be called when the service is no longer needed
   */
  destroy(): void {
    this.isDestroyed = true;
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
    
    // Process any remaining items before destruction
    if (this.batchQueue.length > 0) {
      this.processBatch();
    }
  }

  private categorizeAction(action: string): AuditLogEntry['action_category'] {
    if (action.includes('create')) return 'create';
    if (action.includes('update') || action.includes('edit')) return 'update';
    if (action.includes('delete') || action.includes('remove')) return 'delete';
    if (action.includes('auth') || action.includes('login')) return 'auth';
    if (action.includes('collab')) return 'collaboration';
    if (action.includes('read') || action.includes('view') || action.includes('download')) return 'read';
    if (action.includes('system')) return 'system';
    return 'system';
  }

  private calculateSeverity(action: string): AuditLogEntry['severity'] {
    if (action.includes('delete') || action.includes('remove')) return 'high';
    if (action.includes('auth') || action.includes('password')) return 'medium';
    if (action.includes('system') || action.includes('backup')) return 'high';
    if (action.includes('export') || action.includes('compliance')) return 'medium';
    return 'low';
  }

  private calculateRiskScore(action: string, severity: AuditLogEntry['severity']): number {
    let baseScore = 0;
    
    switch (severity) {
      case 'critical': baseScore = 90; break;
      case 'high': baseScore = 70; break;
      case 'medium': baseScore = 40; break;
      case 'low': baseScore = 10; break;
    }

    // Adjust based on action type
    if (action.includes('delete')) baseScore += 20;
    if (action.includes('system')) baseScore += 15;
    if (action.includes('auth')) baseScore += 10;

    return Math.min(baseScore, 100);
  }

  private isComplianceRelevant(action: string): boolean {
    const complianceActions = [
      'delete', 'remove', 'export', 'share', 'backup', 'restore',
      'auth', 'password', 'team', 'compliance', 'system'
    ];
    
    return complianceActions.some(keyword => action.includes(keyword));
  }

  private generateTags(action: string, entityType?: string): string[] {
    const tags: string[] = [];
    
    if (entityType) tags.push(entityType);
    
    const actionParts = action.split('.');
    tags.push(...actionParts);
    
    return [...new Set(tags)];
  }

  private generateDescription(
    action: string,
    context: AuditContext,
    options: { entityType?: string; entityId?: string }
  ): string {
    const userName = getUserDisplayName({ user: context.user } as any);
    const entityInfo = options.entityType && options.entityId 
      ? ` ${options.entityType} (${options.entityId})`
      : '';
    
    return `${userName} performed ${action}${entityInfo}`;
  }

  private shouldBroadcast(action: string): boolean {
    // Don't broadcast system or read actions
    return !action.includes('system') && !action.includes('read') && !action.includes('view');
  }

  private broadcastActivity(entry: AuditLogEntry, projectId: string): void {
    websocketService.broadcastEvent(`project-${projectId}`, {
      type: 'project_activity',
      payload: {
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        severity: entry.severity
      },
      user_id: entry.user_id,
      user_name: entry.user_name,
      timestamp: entry.created_at,
      room_id: `project-${projectId}`
    });
  }

  private getBrowserInfo(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private convertToCSV(data: AuditLogEntry[]): string {
    if (data.length === 0) return '';

    const headers = [
      'id', 'user_name', 'user_email', 'project_id', 'entity_type', 
      'action', 'action_category', 'description', 'severity', 
      'compliance_relevant', 'created_at'
    ];

    const csvRows = [
      headers.join(','),
      ...data.map(entry => 
        headers.map(header => {
          const value = entry[header as keyof AuditLogEntry];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }
}

// Create singleton instance
export const auditService = new AuditService();

// Convenience functions for common audit actions
export const logProjectActivity = (
  action: AuditAction,
  context: AuditContext,
  options?: Parameters<typeof auditService.logActivity>[2]
) => auditService.logActivity(action, context, { entityType: 'project', ...options });

export const logDocumentActivity = (
  action: AuditAction,
  context: AuditContext,
  documentId: string,
  options?: Parameters<typeof auditService.logActivity>[2]
) => auditService.logActivity(action, context, { 
  entityType: 'document', 
  entityId: documentId, 
  ...options 
});

export const logUserActivity = (
  action: AuditAction,
  context: AuditContext,
  options?: Parameters<typeof auditService.logActivity>[2]
) => auditService.logActivity(action, context, { entityType: 'system', ...options });

// Export types for external use
export type { AuditAction };