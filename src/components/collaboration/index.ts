/**
 * Collaboration Services - BuildEase WebSocket Integration
 * Export only the websocketService for auditService dependency
 */

// Export websocketService for auditService usage
export { websocketService } from '@/services/websocketService';

// Re-export types for websocketService
export type {
  CollaborationEvent,
  UserPresence,
  RealtimeRoom
} from '@/services/websocketService';