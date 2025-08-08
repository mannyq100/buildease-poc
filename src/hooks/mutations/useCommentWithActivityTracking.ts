/**
 * Enhanced Comment Mutation Hooks with Integrated Activity Tracking
 * These hooks combine comment operations with comprehensive activity logging
 * Designed for BuildEase construction project collaboration workflows
 */

import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { TABLE_NAMES } from '@/types/database';
import type { Comment, CommentInsert } from '@/types/database';
import { toast } from 'sonner';
import { useRetryableMutation } from '@/hooks/useRetryableMutation';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { 
  COLLABORATION_ERRORS
} from '@/constants/collaborationConstants';
import { truncateCommentContent } from '@/utils/collaborationUtils';

/**
 * Comment mutation defaults and configuration
 */
const COMMENT_MUTATION_DEFAULTS = {
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000,
  PREVIEW_LENGTH: 100,
  TOAST_DURATION: 4000
} as const;

// Enhanced interfaces with activity tracking support
interface CreateCommentWithTrackingData {
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  content: string;
  parentCommentId?: string;
  projectId: string;
  entityTitle?: string; // For better activity descriptions
}

interface UpdateCommentWithTrackingData {
  commentId: string;
  content: string;
  projectId: string;
  entityType?: 'project' | 'task' | 'phase';
  entityTitle?: string;
  originalContent?: string; // For tracking changes
}

interface DeleteCommentWithTrackingData {
  commentId: string;
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  projectId: string;
  entityTitle?: string;
  commentContent?: string; // For activity logging
}

/**
 * Hook to create a comment with integrated activity tracking
 */
export function useCreateCommentWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const activityTracker = useActivityTracker({ projectId });

  return useRetryableMutation(
    async (data: CreateCommentWithTrackingData): Promise<Comment> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      // Prepare comment data
      const commentData: CommentInsert = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        user_id: user.id,
        content: data.content.trim(),
        parent_comment_id: data.parentCommentId || null,
      };

      // Insert comment
      const { data: comment, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .insert(commentData)
        .select(`
          id,
          entity_type,
          entity_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          updated_at,
          user:be_user!user_id (
            id,
            first_name,
            last_name,
            email,
            settings
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw new Error(`Failed to create comment: ${error.message}`);
      }

      return comment as Comment;
    },
    {
      circuitBreakerKey: 'comment-creation',
      showRetryNotifications: true,
      enableManualRetry: true,
      retryOptions: {
        maxAttempts: COMMENT_MUTATION_DEFAULTS.RETRY_ATTEMPTS,
        baseDelay: COMMENT_MUTATION_DEFAULTS.RETRY_BASE_DELAY
      },
      onSuccess: async (newComment, variables) => {
        // Invalidate comment queries
        queryClient.invalidateQueries({
          queryKey: ['comments', variables.entityType, variables.entityId]
        });

        if (variables.parentCommentId) {
          queryClient.invalidateQueries({
            queryKey: ['comment-thread', variables.parentCommentId]
          });
        }

        queryClient.invalidateQueries({
          queryKey: ['comment-counts']
        });

        // Track comment activity
        try {
          const preview = truncateCommentContent(newComment.content, COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH);
          const isReply = !!variables.parentCommentId;
          const entityContext = variables.entityTitle ? ` on ${variables.entityTitle}` : '';
          
          let activityTitle: string;
          let activityDescription: string;
          
          if (isReply) {
            activityTitle = `Comment reply added${entityContext}`;
            activityDescription = `Reply: "${preview}"`;
          } else {
            activityTitle = `Comment added${entityContext}`;
            activityDescription = `New comment: "${preview}"`;
          }

          await activityTracker.trackActivity(
            'comment_add',
            activityTitle,
            activityDescription,
            {
              entityType: 'comment',
              entityId: newComment.id,
              metadata: {
                commentLength: newComment.content.length,
                isReply,
                parentCommentId: variables.parentCommentId,
                targetEntityType: variables.entityType,
                targetEntityId: variables.entityId,
                targetEntityTitle: variables.entityTitle
              },
              status: 'info'
            }
          );
        } catch (error) {
          console.error('Failed to track comment creation activity:', error);
        }

        // Show success message
        const isReply = !!variables.parentCommentId;
        toast.success(isReply ? 'Reply added successfully' : 'Comment added successfully', {
          duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
        });
      },
      onError: (error: any) => {
        console.error('Error creating comment:', error);
        if (error.message?.includes('duplicate')) {
          toast.error('This comment already exists');
        } else if (error.message?.includes('connection')) {
          toast.error('Connection error. Please check your network and try again.');
        } else {
          toast.error('Failed to add comment. Please try again.');
        }
      }
    }
  );
}

/**
 * Hook to update a comment with integrated activity tracking
 */
export function useUpdateCommentWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const activityTracker = useActivityTracker({ projectId });

  return useRetryableMutation(
    async (data: UpdateCommentWithTrackingData): Promise<Comment> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      const { data: comment, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .update({ 
          content: data.content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.commentId)
        .eq('user_id', user.id) // Ensure users can only update their own comments
        .select(`
          id,
          entity_type,
          entity_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          updated_at,
          user:be_user!user_id (
            id,
            first_name,
            last_name,
            email,
            settings
          )
        `)
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      return comment as Comment;
    },
    {
      circuitBreakerKey: 'comment-update',
      showRetryNotifications: true,
      enableManualRetry: true,
      retryOptions: {
        maxAttempts: COMMENT_MUTATION_DEFAULTS.RETRY_ATTEMPTS,
        baseDelay: COMMENT_MUTATION_DEFAULTS.RETRY_BASE_DELAY
      },
      onSuccess: async (updatedComment, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: ['comments', updatedComment.entity_type, updatedComment.entity_id]
        });

        queryClient.setQueryData(['comment', variables.commentId], updatedComment);

        // Track comment update activity
        try {
          const preview = truncateCommentContent(updatedComment.content, COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH);
          const entityContext = variables.entityTitle ? ` on ${variables.entityTitle}` : '';
          
          await activityTracker.trackActivity(
            'comment_update',
            `Comment updated${entityContext}`,
            `Updated comment: "${preview}"`,
            {
              entityType: 'comment',
              entityId: updatedComment.id,
              metadata: {
                commentLength: updatedComment.content.length,
                targetEntityType: variables.entityType || updatedComment.entity_type,
                targetEntityId: updatedComment.entity_id,
                targetEntityTitle: variables.entityTitle,
                hasContentChange: variables.originalContent !== updatedComment.content
              },
              status: 'info'
            }
          );
        } catch (error) {
          console.error('Failed to track comment update activity:', error);
        }

        toast.success('Comment updated successfully', {
          duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
        });
      },
      onError: (error: any) => {
        console.error('Error updating comment:', error);
        if (error.message?.includes('permission')) {
          toast.error('You can only edit your own comments');
        } else if (error.message?.includes('not found')) {
          toast.error('Comment not found');
        } else {
          toast.error('Failed to update comment. Please try again.');
        }
      }
    }
  );
}

/**
 * Hook to delete a comment with integrated activity tracking
 */
export function useDeleteCommentWithTracking(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  const activityTracker = useActivityTracker({ projectId });

  return useRetryableMutation(
    async (data: DeleteCommentWithTrackingData): Promise<{ commentId: string; entityType: string; entityId: string }> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      const { error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .delete()
        .eq('id', data.commentId)
        .eq('user_id', user.id); // Ensure users can only delete their own comments

      if (error) {
        console.error('Error deleting comment:', error);
        throw new Error(`Failed to delete comment: ${error.message}`);
      }

      return {
        commentId: data.commentId,
        entityType: data.entityType,
        entityId: data.entityId
      };
    },
    {
      circuitBreakerKey: 'comment-deletion',
      showRetryNotifications: true,
      enableManualRetry: true,
      retryOptions: {
        maxAttempts: COMMENT_MUTATION_DEFAULTS.RETRY_ATTEMPTS,
        baseDelay: COMMENT_MUTATION_DEFAULTS.RETRY_BASE_DELAY
      },
      onSuccess: async (result, variables) => {
        // Remove from caches
        queryClient.removeQueries({
          queryKey: ['comment', variables.commentId]
        });

        queryClient.invalidateQueries({
          queryKey: ['comments', variables.entityType, variables.entityId]
        });

        queryClient.invalidateQueries({
          queryKey: ['comment-counts']
        });

        // Track comment deletion activity
        try {
          const entityContext = variables.entityTitle ? ` on ${variables.entityTitle}` : '';
          const contentPreview = variables.commentContent 
            ? truncateCommentContent(variables.commentContent, COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH)
            : 'comment';
          
          await activityTracker.trackActivity(
            'comment_delete',
            `Comment deleted${entityContext}`,
            `Removed comment: "${contentPreview}"`,
            {
              entityType: 'comment',
              entityId: variables.commentId,
              metadata: {
                targetEntityType: variables.entityType,
                targetEntityId: variables.entityId,
                targetEntityTitle: variables.entityTitle,
                commentLength: variables.commentContent?.length || 0
              },
              status: 'warning'
            }
          );
        } catch (error) {
          console.error('Failed to track comment deletion activity:', error);
        }

        toast.success('Comment deleted successfully', {
          duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
        });
      },
      onError: (error: any) => {
        console.error('Error deleting comment:', error);
        if (error.message?.includes('permission')) {
          toast.error('You can only delete your own comments');
        } else if (error.message?.includes('not found')) {
          toast.error('Comment not found');
        } else {
          toast.error('Failed to delete comment. Please try again.');
        }
      }
    }
  );
}

/**
 * Hook to get project ID from entity context for activity tracking
 * This helper function can be used to resolve project ID from task/phase entities
 */
export function useResolveProjectIdForComment(entityType: 'project' | 'task' | 'phase', entityId: string) {
  if (entityType === 'project') {
    return entityId;
  }

  // For tasks and phases, we'll need to resolve the project ID
  // This would typically be done through additional queries
  // For now, this is a placeholder that should be implemented based on your data structure
  
  // Implementation would look something like:
  // const { data: entity } = useQuery({
  //   queryKey: [entityType, entityId],
  //   queryFn: async () => {
  //     const { data } = await supabase
  //       .from(entityType === 'task' ? 'be_task' : 'be_phase')
  //       .select('project_id')
  //       .eq('id', entityId)
  //       .single();
  //     return data?.project_id;
  //   },
  //   enabled: entityType !== 'project'
  // });
  
  // return entity || entityId; // fallback to entityId if project_id not found
  
  return entityId; // Temporary fallback
}