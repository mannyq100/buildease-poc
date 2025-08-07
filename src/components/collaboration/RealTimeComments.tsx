/**
 * RealTimeComments Component
 * Enhanced comments system with real-time collaboration features
 * Integrates with existing comments infrastructure and adds live updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { useComments, useCreateComment } from '@/hooks/queries/useComments';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import type { CollaborationEvent } from '@/services/websocketService';
import { CollaborationErrorBoundary, NetworkErrorFallback, useErrorHandler } from './ErrorBoundary';
import { CommentHeader } from './CommentHeader';
import { TypingIndicator } from './TypingIndicator';
import { CommentInput } from './CommentInput';
import { CommentListView } from './CommentListView';

// Constants for better maintainability
const REALTIME_COMMENTS_CONSTANTS = {
  NEW_COMMENT_HIGHLIGHT_DURATION: 5000,
  SCROLL_DELAY_MS: 100,
  MAX_HEIGHT_DEFAULT: '400px',
  INLINE_MAX_HEIGHT: '300px'
} as const;

interface RealTimeCommentsProps {
  entityType: 'project' | 'phase' | 'task';
  entityId: string;
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  enableNotifications?: boolean;
}

function RealTimeCommentsCore({
  entityType,
  entityId,
  className = '',
  showHeader = true,
  maxHeight = REALTIME_COMMENTS_CONSTANTS.MAX_HEIGHT_DEFAULT,
  enableNotifications = true
}: RealTimeCommentsProps) {
  const { error, handleError } = useErrorHandler();
  const [newComment, setNewComment] = useState('');
  const [notifications, setNotifications] = useState(enableNotifications);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Room ID for collaboration
  const roomId = `${entityType}-${entityId}-comments`;

  // Data and mutations
  const { data: comments = [], refetch: refetchComments, isLoading } = useComments(entityType, entityId);
  const createCommentMutation = useCreateComment();

  // Real-time collaboration
  const {
    isJoined,
    typingUsers,
    startTyping,
    stopTyping,
    broadcastEvent,
    onlineCount
  } = useRealTimeCollaboration({
    roomId,
    roomType: entityType === 'project' ? 'project' : 'document',
    entityId,
    enabled: true,
    onEvent: handleCollaborationEvent
  });

  // Handle real-time collaboration events
  const handleCollaborationEvent = useCallback((event: CollaborationEvent) => {
    switch (event.type) {
      case 'comment_added':
        // Refresh comments to show new comment
        refetchComments();
        
        // Mark as new comment for highlighting
        const commentId = event.payload.comment_id as string;
        if (commentId) {
          setNewCommentIds(prev => new Set(prev).add(commentId));
          
          // Remove new comment highlight after timeout
          setTimeout(() => {
            setNewCommentIds(prev => {
              const updated = new Set(prev);
              updated.delete(commentId);
              return updated;
            });
          }, REALTIME_COMMENTS_CONSTANTS.NEW_COMMENT_HIGHLIGHT_DURATION);
        }

        // Show notification
        if (notifications && event.user_name) {
          toast.success(`New comment from ${event.user_name}`, {
            duration: 4000,
            action: {
              label: 'View',
              onClick: () => scrollToBottom()
            }
          });
        }
        break;

      case 'comment_updated':
      case 'comment_deleted':
        refetchComments();
        break;
    }
  }, [notifications, refetchComments]);

  // Handle comment input changes
  const handleCommentChange = useCallback((value: string) => {
    setNewComment(value);
  }, []);

  // Handle comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || createCommentMutation.isPending) return;

    try {
      const comment = await createCommentMutation.mutateAsync({
        entityType,
        entityId,
        content: newComment.trim()
      });

      // Clear form
      setNewComment('');

      // Broadcast comment added event
      broadcastEvent({
        type: 'comment_added',
        payload: {
          comment_id: comment.id,
          content: comment.content,
          entity_type: entityType,
          entity_id: entityId
        }
      });

      // Scroll to bottom to show new comment
      setTimeout(scrollToBottom, REALTIME_COMMENTS_CONSTANTS.SCROLL_DELAY_MS);

    } catch (error) {
      console.error('Failed to create comment:', error);
      handleError(error as Error);
    }
  }, [newComment, createCommentMutation, entityType, entityId, broadcastEvent, handleError]);


  // Scroll to bottom of comments
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (comments.length > 0) {
      scrollToBottom();
    }
  }, [comments.length]);


  // Handle error state
  if (error) {
    return (
      <NetworkErrorFallback
        error={error}
        resetError={() => window.location.reload()}
        retryCount={0}
        maxRetries={3}
      />
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CommentHeader
          commentCount={comments.length}
          isJoined={isJoined}
          onlineCount={onlineCount}
          notifications={notifications}
          onToggleNotifications={() => setNotifications(!notifications)}
        />
      )}

      <CardContent className="space-y-4">
        {/* Comments List */}
        <CommentListView
          comments={comments}
          entityType={entityType}
          entityId={entityId}
          isLoading={isLoading}
          maxHeight={maxHeight}
          scrollAreaRef={scrollAreaRef}
          newCommentIds={newCommentIds}
        />

        {/* Typing Indicators */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Comment Input */}
        <CommentInput
          value={newComment}
          onChange={handleCommentChange}
          onSubmit={handleSubmitComment}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
          isSubmitting={createCommentMutation.isPending}
          disabled={false}
        />
      </CardContent>
    </Card>
  );
}

// Export the main component wrapped with error boundary
export function RealTimeComments(props: RealTimeCommentsProps) {
  return (
    <CollaborationErrorBoundary
      fallback={NetworkErrorFallback}
      onError={(error, errorInfo) => {
        console.error('RealTimeComments Error:', error, errorInfo);
        // Could integrate with error reporting service here
      }}
      maxRetries={3}
      resetKeys={[props.entityType, props.entityId]}
    >
      <RealTimeCommentsCore {...props} />
    </CollaborationErrorBoundary>
  );
}

// Lightweight version for inline use
export function InlineRealTimeComments({
  entityType,
  entityId,
  className = ''
}: Omit<RealTimeCommentsProps, 'showHeader' | 'maxHeight'>) {
  return (
    <RealTimeComments
      entityType={entityType}
      entityId={entityId}
      className={className}
      showHeader={false}
      maxHeight={REALTIME_COMMENTS_CONSTANTS.INLINE_MAX_HEIGHT}
      enableNotifications={false}
    />
  );
}