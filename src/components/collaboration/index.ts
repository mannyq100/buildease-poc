/**
 * Collaboration Components - BuildEase Real-time Collaboration
 * Export all real-time collaboration components
 */

export { PresenceIndicator } from './PresenceIndicator';
export { LiveCursors, ContainerLiveCursors } from './LiveCursors';
export { RealTimeComments, InlineRealTimeComments } from './RealTimeComments';
export { RealTimeNotifications } from './RealTimeNotifications';
export { CollaborativeDocumentViewer } from './CollaborativeDocumentViewer';
export { CollaborationDashboard } from './CollaborationDashboard';
export { CollaborationProvider, useCollaboration } from './CollaborationProvider';

// Re-export hooks and services for convenience
export { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
export { websocketService } from '@/services/websocketService';

// Re-export types for convenience
export type {
  CollaborationEvent,
  UserPresence,
  RealtimeRoom
} from '@/services/websocketService';